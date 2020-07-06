import * as FabricCAServices from 'fabric-ca-client';
import { Gateway, Wallets, X509Identity, DefaultEventHandlerStrategies } from 'fabric-network'
import { Request, Response } from "express"
import { HTTP_INTERNAL_SERVER_ERROR } from "../../core/constants/HTTPCodes"
import { errorResponse, successResponse } from "../../core/helpers"
import { env } from "../../core/helpers"
const fs = require('fs');

class MedicalRecordController {
    async enrollAdmin(req: Request, res: Response) {
        try {
            // load the network configuration
            const ccpPath: string = env('CONNECTION_PROFILE_PATH')
            const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

            // Create a new CA client for interacting with the CA.
            const certificateAuthority: string = env('CERTIFICATE_AUTHORITY')
            const caInfo = ccp.certificateAuthorities[certificateAuthority];
            const caTLSCACerts = caInfo.tlsCACerts.pem;
            const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

            // Create a new file system based wallet for managing identities.
            const walletPath: string = env('WALLET_PATH')
            const wallet = await Wallets.newFileSystemWallet(walletPath);

            const mspOrganisation: string = env('MSP_ORGANISATION')
            const enrollmentAdminID: string = env('ENROLLMENT_ADMIN_ID')
            const enrollmentAdminSecret: string = env('ENROLLMENT_ADMIN_SECRET')
            // Check to see if we've already enrolled the user.
            const identity = await wallet.get(enrollmentAdminID);
            if (identity) {
                console.log(`An identity for the admin user "${enrollmentAdminID}" already exists in the wallet`);
                successResponse({ res, data: `Successfully enrolled admin user "${enrollmentAdminID}" and imported it into the wallet` })
                return;
            }

            // Enroll the user, and import the new identity into the wallet.
            const enrollment = await ca.enroll({ enrollmentID: enrollmentAdminID, enrollmentSecret: enrollmentAdminSecret });
            const x509Identity: X509Identity = {
                credentials: {
                    certificate: enrollment.certificate,
                    privateKey: enrollment.key.toBytes(),
                },
                mspId: mspOrganisation,
                type: 'X.509',
            };
            await wallet.put(enrollmentAdminID, x509Identity);
            console.log(`Successfully enrolled admin user "${enrollmentAdminID}" and imported it into the wallet`);
            successResponse({ res, data: `Successfully enrolled admin user "${enrollmentAdminID}" and imported it into the wallet` })

        } catch (error) {
            console.error(`Failed to enroll user : ${error}`);
            errorResponse({ res, message: error.message, code: HTTP_INTERNAL_SERVER_ERROR })
        }
    }

    async enrollUser(req: Request, res: Response) {
        try {
            // load the network configuration
            const ccpPath: string = env('CONNECTION_PROFILE_PATH')
            const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

            // Create a new CA client for interacting with the CA.
            const certificateAuthority: string = env('CERTIFICATE_AUTHORITY')
            const caInfo = ccp.certificateAuthorities[certificateAuthority];
            const caTLSCACerts = caInfo.tlsCACerts.pem;
            const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

            // Create a new file system based wallet for managing identities.
            const walletPath: string = env('WALLET_PATH')
            const wallet = await Wallets.newFileSystemWallet(walletPath);

            const mspOrganisation: string = env('MSP_ORGANISATION')
            const enrollmentAdminID: string = env('ENROLLMENT_ADMIN_ID')
            const enrollmentUserID: string = env('ENROLLMENT_USER_ID')

            // Check to see if we've already enrolled the user.
            const userIdentity = await wallet.get(enrollmentUserID);
            if (userIdentity) {
                console.log(`An identity for the user "${enrollmentUserID}" already exists in the wallet`);
                return;
            }

            // Check to see if we've already enrolled the admin user.
            const adminIdentity = await wallet.get(enrollmentAdminID);
            if (!adminIdentity) {
                console.log(`An identity for the admin user "${enrollmentAdminID}" does not exist in the wallet`);
                console.log('Run the enrollAdmin application before retrying');
                return;
            }

            // build a user object for authenticating with the CA
            const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
            const adminUser = await provider.getUserContext(adminIdentity, enrollmentUserID);

            // Register the user, enroll the user, and import the new identity into the wallet.
            const secret = await ca.register({ affiliation: 'org1', enrollmentID: enrollmentUserID, role: 'client' }, adminUser);
            const enrollment = await ca.enroll({ enrollmentID: enrollmentUserID, enrollmentSecret: secret });
            const x509Identity: X509Identity = {
                credentials: {
                    certificate: enrollment.certificate,
                    privateKey: enrollment.key.toBytes(),
                },
                mspId: mspOrganisation,
                type: 'X.509',
            };
            await wallet.put(enrollmentUserID, x509Identity);
            console.log(`Successfully registered and enrolled user "${enrollmentUserID}" and imported it into the wallet`);
            successResponse({ res, data: `Successfully enrolled user "${enrollmentUserID}" and imported it into the wallet` })

        } catch (error) {
            console.error(`Failed to enroll user : ${error}`);
            errorResponse({ res, message: error.message, code: HTTP_INTERNAL_SERVER_ERROR })
        }
    }

    async create(req: Request, res: Response) {
        try {

            // load the network configuration
            // const ccpPath = path.join(process.cwd(), 'assests\\connection.json')
            const ccpPath: string = env('CONNECTION_PROFILE_PATH')
            const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

            // Create a new file system based wallet for managing identities.
            // const walletPath = path.join(process.cwd(), 'assests\\wallet');
            const walletPath: string = env('WALLET_PATH')
            const wallet = await Wallets.newFileSystemWallet(walletPath);
            console.log(`Wallet path: ${walletPath}`);

            // Check to see if we've already enrolled the user.
            const identity = await wallet.get('admin');
            if (!identity) {
                throw Error("An identity for the user does not exist in the wallet, Register the user before retrying");
            }

            const connectOptions = {
                wallet,
                identity: 'admin',
                discovery: { enabled: true, asLocalhost: true },
                eventHandlerOptions: { strategy: DefaultEventHandlerStrategies.MSPID_SCOPE_ALLFORTX }
            }
            // Create a new gateway for connecting to our peer node.
            const gateway = new Gateway();
            await gateway.connect(ccp, connectOptions);

            // Get the network (channel) our contract is deployed to.
            const network = await gateway.getNetwork(env("CHANNEL_NAME"));
            // Get the contract from the network.
            const contract = network.getContract(env("SMART_CONTRACT_NAME"));

            if (req.body.patientID && req.body.medicalRecords) {
                // Submit the specified transaction.
                await contract.submitTransaction('createMedicalRecord', req.body.patientID, JSON.stringify(req.body.medicalRecords));
                console.log(`Transaction has been submitted`);

                // Disconnect from the gateway.
                await gateway.disconnect();

                return successResponse({ res, data: `Medical Record Created for patient ${req.body.patientID}` })
            }
            throw Error("Missing input parameter in request")

        } catch (err) {
            errorResponse({ res, message: err.message, code: HTTP_INTERNAL_SERVER_ERROR })
        }
    }

    async query(req: Request, res: Response) {
        try {

            // load the network configuration
            // const ccpPath = path.join(process.cwd(), 'assests\\connection.json')
            const ccpPath: string = env('CONNECTION_PROFILE_PATH')
            const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

            // Create a new file system based wallet for managing identities.
            // const walletPath = path.join(process.cwd(), 'assests\\wallet');
            const walletPath: string = env('WALLET_PATH')
            const wallet = await Wallets.newFileSystemWallet(walletPath);
            console.log(`Wallet path: ${walletPath}`);

            // Check to see if we've already enrolled the user.
            const identity = await wallet.get('admin');
            if (!identity) {
                throw Error("An identity for the user does not exist in the wallet, Register the user before retrying");
            }

            const connectOptions = {
                wallet,
                identity: 'admin',
                discovery: { enabled: true, asLocalhost: true },
                eventHandlerOptions: { strategy: DefaultEventHandlerStrategies.MSPID_SCOPE_ALLFORTX }
            }
            // Create a new gateway for connecting to our peer node.
            const gateway = new Gateway();
            await gateway.connect(ccp, connectOptions);

            // Get the network (channel) our contract is deployed to.
            const network = await gateway.getNetwork(env("CHANNEL_NAME"));
            // Get the contract from the network.
            const contract = network.getContract(env("SMART_CONTRACT_NAME"));

            if (req.body.patientID) {
                // Evaluate the specified transaction.
                const result = await contract.evaluateTransaction('getMedicalRecord', req.body.patientID);

                // Disconnect from the gateway.
                await gateway.disconnect();

                return successResponse({ res, data: JSON.parse(result.toString()) })
            }

            throw Error("Please input the valid patientID")

        } catch (err) {
            errorResponse({ res, message: err.message, code: HTTP_INTERNAL_SERVER_ERROR })
        }
    }

    async update(req: Request, res: Response) {
        try {
            // load the network configuration
            // const ccpPath = path.join(process.cwd(), 'assests\\connection.json')
            const ccpPath: string = env('CONNECTION_PROFILE_PATH')
            const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

            console.log(`process.cwd() -- ${process.cwd()}`)

            // Create a new file system based wallet for managing identities.
            // const walletPath = path.join(process.cwd(), 'assests\\wallet');
            const walletPath: string = env('WALLET_PATH')
            const wallet = await Wallets.newFileSystemWallet(walletPath);
            console.log(`Wallet path: ${walletPath}`);

            // Check to see if we've already enrolled the user.
            const identity = await wallet.get('admin');
            if (!identity) {
                throw Error("An identity for the user does not exist in the wallet, Register the user before retrying");
            }
            const connectOptions = {
                wallet,
                identity: 'admin',
                discovery: { enabled: true, asLocalhost: true },
                eventHandlerOptions: { strategy: DefaultEventHandlerStrategies.MSPID_SCOPE_ALLFORTX }
            }
            // Create a new gateway for connecting to our peer node.
            const gateway = new Gateway();
            await gateway.connect(ccp, connectOptions);


            // Get the network (channel) our contract is deployed to.
            const network = await gateway.getNetwork(env("CHANNEL_NAME"));
            // Get the contract from the network.
            const contract = network.getContract(env("SMART_CONTRACT_NAME"));

            if (req.body.patientID && req.body.medicalRecords) {
                // Submit the specified transaction.
                const updateResponse = await contract.submitTransaction('updateMedicalRecord', req.body.patientID, JSON.stringify(req.body.medicalRecords));
                console.log(`updateMyAsset Transaction has been submitted`);

                // Disconnect from the gateway.
                await gateway.disconnect();

                return successResponse({ res, data: JSON.parse(updateResponse.toString()) })
            }
            throw Error("Missing input parameter in request")

        } catch (err) {
            errorResponse({ res, message: err.message, code: HTTP_INTERNAL_SERVER_ERROR })
        }
    }
}

export default MedicalRecordController
