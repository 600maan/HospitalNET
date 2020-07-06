# hospitalnet-contract
***hospitalnet-contract*** is the Smart Contract which facilitates the create, read and update operations of patient's medical records on blockchain. It also emits events for medical records create and update operations under topic createMedicalrecord and updateMedicalRecord

## requirement's
1. Visual Studio Code (1.38) 
2. IBM Blockchain Platform Extension for VS Code (1.0.31)

#### Follow up the steps to configure the IBM Blockchain Platform Extension for VS Code
- [Dependency Installation for IBM Blockchain Platform Extension](https://github.com/IBM-Blockchain/blockchain-vscode-extension/blob/master/README.md#dependency-installation)

## smart contract's 
1. **medicalRecordExists**
    - Check if the medical record for a patient exists in blockchain 
2. **createMedicalRecord**
    - Create a medical record for new patients 
3. **getMedicalRecord**
    - Retrive the entire medical history of existing patients 
4. **updateMedicalRecord**
    - Append the new medical records of patient to the existing medical records


## deploying *hospitalnet-contract* to local hyperledger fabric network

* Start an local instance of a Hyperledger Fabric network
* Package the hospitalnet-contract
* Deploy the hospitalnet-contract to the local Hyperledger Fabric network
