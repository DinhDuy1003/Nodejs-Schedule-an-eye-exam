import express from "express";
import homeController from "../controllers/homeController";
import userControllers from"../controllers/userControllers";
import doctorController from "../controllers/doctorController";
let router = express.Router();

let initWebRoutes = (app) => {
    router.get('/', homeController.getHomePage);
    router.get('/about', homeController.getAboutPage);
    router.get('/crud',homeController.getCRUD);
    router.post('/post-crud',homeController.postCRUD);

    router.get('/get-crud',homeController.displayGetCRUD);
    router.get('/edit-crud',homeController.getEditCRUD);
    
    router.post('/put-crud',homeController.putCRUD);
    router.get('/delete-crud',homeController.deleteCRUD);

    router.post('/api/login',userControllers.handleLogin);
    router.get('/api/get-all-users',userControllers.handleGetAllUsers);
    router.post('/api/create-new-user',userControllers.handleCreateNewUser);
    router.put('/api/edit-user',userControllers.handleEditUser);
    router.delete('/api/delete-user',userControllers.handleDeleteUser);
    router.get('/api/allcode',userControllers.getAllCode)

   router.get('/api/top-doctor-home',doctorController.getTopDoctorHome)
   router.get('/api/get-all-doctors',doctorController.getAllDoctors)
   router.post('/api/save-infor-doctors',doctorController.postinforDoctor)
    return app.use("/", router);
}

module.exports = initWebRoutes;