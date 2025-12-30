import { Router } from "express";
import { checkTcNo } from "../middlewares/user";
import { authMiddleware } from "../controllers/auth";
import { loginController, registerController, updateMeController, getMeController, changePasswordController } from "../controllers/index";
import { createNewClinicController, deleteClinicController, getClinicByIdController, getCliniccontroller, updateExistingClinicController } from "../controllers/clinic";
import { createAppointmentController, getAllAppointmentController, getAppointmentByIdController, getMyAppointmentsAsDoctorController, getMyAppointmentsAsPatientController, updateAppointmentController } from "../controllers/appointment";
import { createNewExaminationsController, deleteExaminationsByIdController, getAllExaminationsController, getExaminationsByDoctorIdController, getExaminationsByIdController, getExaminationsByPatientIdController, updateExistingExaminationsController } from "../controllers/examination";
import { getDiagnosisSuggestionController } from "../controllers/ai";

const router = Router();

router.get("/", (req, res) => {
    res.json({ message: "API çalışıyor!" });
});

router.post("/register", checkTcNo, registerController)

router.post("/login", loginController);

router.get("/users/me", authMiddleware, getMeController);
router.put("/users/me", authMiddleware, updateMeController)
router.put("/users/me/password", authMiddleware, changePasswordController);

router.get("/appointments", authMiddleware, getAllAppointmentController);
router.get("/appointments/doctor/:doctorId", authMiddleware, getMyAppointmentsAsDoctorController);
router.get("/appointments/patient/:patientId", authMiddleware, getMyAppointmentsAsPatientController);
router.get("/appointments/:id", authMiddleware, getAppointmentByIdController);
router.post("/appointments", authMiddleware, createAppointmentController);
router.put("/appointments/:id", authMiddleware, updateAppointmentController);

router.get("/examinations", authMiddleware, getAllExaminationsController);
router.get("/examinations/doctor/:doctorId", authMiddleware, getExaminationsByDoctorIdController);
router.get("/examinations/patient/:patientId", authMiddleware, getExaminationsByPatientIdController);
router.get("/examinations/:id", authMiddleware, getExaminationsByIdController);
router.post("/examinations", authMiddleware, createNewExaminationsController);
router.put("/examinations/:id", authMiddleware, updateExistingExaminationsController);
router.delete("/examinations/:id", authMiddleware, deleteExaminationsByIdController);

router.post("/ai/diagnosis", authMiddleware, getDiagnosisSuggestionController);

router.get("/clinics", getCliniccontroller);
router.get("/clinics/:id", getClinicByIdController);
router.post("/clinics", authMiddleware, createNewClinicController);
router.put("/clinics/:id", authMiddleware, updateExistingClinicController);
router.delete("/clinics/:id", authMiddleware, deleteClinicController);

import { getAllPatientsController, getPatientsByDoctorController, updatePatientController } from "../controllers/patient";
import { getAllDoctorsController, updateExistingDoctorController } from "../controllers/doctor";

router.get("/patients", authMiddleware, getAllPatientsController);
router.get("/patients/doctor/:doctorId", authMiddleware, getPatientsByDoctorController);
router.put("/patients/:id", authMiddleware, updatePatientController);
router.get("/doctors", authMiddleware, getAllDoctorsController);
router.put("/doctors/:id", authMiddleware, updateExistingDoctorController);

export default router;

