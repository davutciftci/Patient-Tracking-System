import { Router } from "express";
import { checkTcNo } from "../middlewares/user";
import { authMiddleware } from "../controllers/auth";
import { loginController, registerController, updateMeController, getMeController } from "../controllers/index";
import { createNewClinicController, deleteClinicController, getClinicByIdController, getCliniccontroller, updateExistingClinicController } from "../controllers/clinic";
import { createAppointmentController, getAllAppointmentController, getAppointmentByIdController, getMyAppointmentsAsDoctorController, getMyAppointmentsAsPatientController, updateAppointmentController } from "../controllers/appointment";
import { createNewExaminationsController, deleteExaminationsByIdController, getAllExaminationsController, getExaminationsByDoctorIdController, getExaminationsByIdController, getExaminationsByPatientIdController, updateExistingExaminationsController } from "../controllers/examination";


const router = Router();

// Test route
router.get("/", (req, res) => {
    res.json({ message: "API çalışıyor!" });
});

router.post("/register", checkTcNo, registerController)

// Auth routes
router.post("/login", loginController);

router.get("/users/me", authMiddleware, getMeController);
router.put("/users/me", authMiddleware, updateMeController)

// Appointment routes
router.get("/appointments", authMiddleware, getAllAppointmentController);
router.get("/appointments/doctor/:doctorId", authMiddleware, getMyAppointmentsAsDoctorController);
router.get("/appointments/patient/:patientId", authMiddleware, getMyAppointmentsAsPatientController);
router.get("/appointments/:id", authMiddleware, getAppointmentByIdController);
router.post("/appointments", authMiddleware, createAppointmentController);
router.put("/appointments/:id", authMiddleware, updateAppointmentController);

// Examination routes
router.get("/examinations", authMiddleware, getAllExaminationsController);
router.get("/examinations/doctor/:doctorId", authMiddleware, getExaminationsByDoctorIdController);
router.get("/examinations/patient/:patientId", authMiddleware, getExaminationsByPatientIdController);
router.get("/examinations/:id", authMiddleware, getExaminationsByIdController);
router.post("/examinations", authMiddleware, createNewExaminationsController);
router.put("/examinations/:id", authMiddleware, updateExistingExaminationsController);
router.delete("/examinations/:id", authMiddleware, deleteExaminationsByIdController);

// Clinic routes
router.get("/clinics", getCliniccontroller);
router.get("/clinics/:id", getClinicByIdController);
router.post("/clinics", authMiddleware, createNewClinicController);
router.put("/clinics/:id", authMiddleware, updateExistingClinicController);
router.delete("/clinics/:id", authMiddleware, deleteClinicController);

// Patient & Doctor list routes
import { getAllPatientsController } from "../controllers/patient";
import { getAllDoctorsController } from "../controllers/doctor";

router.get("/patients", authMiddleware, getAllPatientsController);
router.get("/doctors", authMiddleware, getAllDoctorsController);

export default router;

