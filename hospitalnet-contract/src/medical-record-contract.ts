import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import { MedicalRecord } from './medical-record';

@Info({title: 'MedicalRecordContract', description: 'HospitalNET Smart Contract' })
export class MedicalRecordContract extends Contract {

    @Transaction(false)
    @Returns('boolean')
    public async medicalRecordExists(ctx: Context, patientID: string): Promise<boolean> {
        const buffer = await ctx.stub.getState(patientID);
        return (!!buffer && buffer.length > 0);
    }

    @Transaction()
    public async createMedicalRecord(ctx: Context, patientID: string, medicalRecords: string): Promise<void> {
        const exists = await this.medicalRecordExists(ctx, patientID);
        if (exists) {
            throw new Error(`The patient with ${patientID} already exists`);
        }
        const medicalRecord = new MedicalRecord()
        medicalRecord.patientID = patientID
        medicalRecord.medicalRecords = JSON.parse(medicalRecords)
        const buffer = Buffer.from(JSON.stringify(medicalRecord));
        await ctx.stub.putState(patientID, buffer);
        const eventPayload: Buffer = Buffer.from(`Created Medical Record ${patientID} (${medicalRecords})`);
        ctx.stub.setEvent('createMedicalRecord', eventPayload);
    }

    @Transaction(false)
    @Returns('MedicalRecord')
    public async getMedicalRecord(ctx: Context, patientID: string): Promise<MedicalRecord> {
        const exists = await this.medicalRecordExists(ctx, patientID);
        if (!exists) {
            throw new Error(`The medical record for ${patientID} does not exist`);
        }
        const buffer = await ctx.stub.getState(patientID);
        return JSON.parse(buffer.toString()) as MedicalRecord;
    }

    @Transaction()
    @Returns('MedicalRecord')
    public async updateMedicalRecord(ctx: Context, patientID: string, medicalRecords: string): Promise<MedicalRecord> {
        const medicalRecord = await this.getMedicalRecord(ctx, patientID);
        if (!medicalRecord) {
            throw new Error(`The medical record for ${patientID} does not exist`);
        }
        const medicalRecordsArray = JSON.parse(medicalRecords) 
        medicalRecordsArray.forEach((element: Object) => {
            medicalRecord.medicalRecords.push(element)
        });
        const buffer = Buffer.from(JSON.stringify(medicalRecord));
        await ctx.stub.putState(patientID, buffer);
        const eventPayload: Buffer = Buffer.from(`Updated Medical Record ${patientID} (${medicalRecord})`);
        ctx.stub.setEvent('updateMedicalRecord', eventPayload);
        return medicalRecord;
    }
}
