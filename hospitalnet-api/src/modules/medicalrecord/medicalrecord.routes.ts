import { Router } from "express"
import { auth } from "../../core/middleware"
import MedicalRecordController from "./MedicalRecordController"

export const MedicalRecordRoutes = (router: Router) => {
    router.post("/enrollAdmin/", auth, (new MedicalRecordController()).enrollAdmin)
    router.post("/enrollUser/", auth, (new MedicalRecordController()).enrollUser)
    router.post("/create/", auth, (new MedicalRecordController()).create)
    router.post("/query/", auth, (new MedicalRecordController()).query)
    router.post("/update/", auth, (new MedicalRecordController()).update)
    return router
}
