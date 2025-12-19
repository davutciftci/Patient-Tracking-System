import { Router } from "express";
import { loginController, registerController } from "../controllers/user";
//import { createAppointment, createClinic, createExamination, deleteAppointment, deleteClinic, deleteExamination, getAppointment, getAppointmentById, getClinic, getClinicById, getExamination, getExaminationById, updateAppointment, updateClinic, updateExamination } from "../controllers/appointment";

const router = Router();

// Test route
router.get("/", (req, res) => {
    res.json({ message: "API çalışıyor!" });
});
router.post("/register", registerController)

// Auth routes
router.post("/login", loginController);

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

