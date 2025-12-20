import { Router } from "express";
import { checkTcNo } from "../middlewares/user";
import { authMiddleware } from "../controllers/auth";
import { loginController, registerController, updateMeController, getMeController } from "../controllers/index";
//import { createAppointment, createClinic, createExamination, deleteAppointment, deleteClinic, deleteExamination, getAppointment, getAppointmentById, getClinic, getClinicById, getExamination, getExaminationById, updateAppointment, updateClinic, updateExamination } from "../controllers/appointment";

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

// // Appointment routes
// router.post("/appointments", createAppointment);
// router.get("/appointments", getAppointment);
// router.get("/appointments/:id", getAppointmentById);
// router.put("/appointments/:id", updateAppointment);
// router.delete("/appointments/:id", deleteAppointment);

// // Examination routes
// router.post("/examinations", createExamination);
// router.get("/examinations", getExamination);
// router.get("/examinations/:id", getExaminationById);
// router.put("/examinations/:id", updateExamination);
// router.delete("/examinations/:id", deleteExamination);

// // Clinic routes
// router.post("/clinics", createClinic);
// router.get("/clinics", getClinic);
// router.get("/clinics/:id", getClinicById);
// router.put("/clinics/:id", updateClinic);
// router.delete("/clinics/:id", deleteClinic);

export default router;

