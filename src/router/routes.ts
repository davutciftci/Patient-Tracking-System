import { Router } from "express";
import { checkTcNo } from "../middlewares/user";
import { authMiddleware } from "../controllers/auth";
import { loginController, registerController, updateMeController, getMeController } from "../controllers/index";
import { createNewClinicController, deleteClinicController, getClinicByIdController, getCliniccontroller, updateExistingClinicController } from "../controllers/clinic";
import { createAppointmentController, getAllAppointmentController, getAppointmentByIdController, getMyAppointmentsAsDoctorController, getMyAppointmentsAsPatientController, updateAppointmentController } from "../controllers/appointment";


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
router.get("/appointments/:id", authMiddleware, getAppointmentByIdController);
router.get("/appointments/patient/:patientId", authMiddleware, getMyAppointmentsAsPatientController);
router.get("/appointments/doctor/:doctorId", authMiddleware, getMyAppointmentsAsDoctorController);
router.post("/appointments", authMiddleware, createAppointmentController);
router.put("/appointments/:id", authMiddleware, updateAppointmentController);

// // Examination routes
// router.post("/examinations", createExamination);
// router.get("/examinations", getExamination);
// router.get("/examinations/:id", getExaminationById);
// router.put("/examinations/:id", updateExamination);
// router.delete("/examinations/:id", deleteExamination);

// Clinic routes
router.get("/clinics", getCliniccontroller);
router.get("/clinics/:id", getClinicByIdController);
router.post("/clinics", authMiddleware, createNewClinicController);
router.put("/clinics/:id", authMiddleware, updateExistingClinicController);
router.delete("/clinics/:id", authMiddleware, deleteClinicController);

export default router;

