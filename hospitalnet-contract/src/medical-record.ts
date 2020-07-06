import { Object, Property } from 'fabric-contract-api';

@Object()
export class MedicalRecord {

    @Property()
    public patientID: string
    public medicalRecords: Object[]

}
