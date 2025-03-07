const { Op } = require('sequelize');
const { Usuario, Animal, AdoptionRequest, ApplicantsResidence, PersonalReference, PreviousPet, PreviousPetsVaccine, ResidencesTenant, TenantsPsychologicalData } = require('../../db');
const { generateId } = require("../utils/utils");
const { transporter } = require("../utils/mailer");
const approvedAdoptionRequestEmailTemplate = require('./htmlTemplates/approvedAdoptionRequestEmailTemplate');

const postAdoptionRequest = async (req, res) => {

    try {
        const { adoption_request_data } = req.body;
        const adoptionRequestId = generateId();

        const user_id = adoption_request_data.user_id;
        const pet_id = adoption_request_data.pet_id;

        //LA NUEVA SOLICITUD DE ADOPCION
        const newAdoptionRequest = await AdoptionRequest.create({
            id: adoptionRequestId,
            phoneNumber: adoption_request_data.phoneNumber,
            workplacePhoneNumber: adoption_request_data.workplacePhoneNumber,
            educationalLevel: adoption_request_data.educationalLevel,
            reasonForRequest: adoption_request_data.reasonForRequest,
            numberOfTenants: adoption_request_data.numberOfTenants,
            allTenantsAgreeToAdoption: adoption_request_data.allTenantsAgreeToAdoption,
            acceptsPeriodicVisits: adoption_request_data.acceptsPeriodicVisits,
            plansToChangeResidence: adoption_request_data.plansToChangeResidence,
            knowYourNextResidence: adoption_request_data.knowYourNextResidence,
            childrenUnder10Years: adoption_request_data.childrenUnder10Years,
            allergies: adoption_request_data.allergies
        })

        //DATOS PSICOLOGICOS DEL SOLICITANTE
        const newApplicantsPsychologicalData = await TenantsPsychologicalData.create({
            id: generateId(),
            withNoisyPet: adoption_request_data.psychologicalData.withNoisyPet,
            withHyperactivePet: adoption_request_data.psychologicalData.withHyperactivePet,
            withCalmPet: adoption_request_data.psychologicalData.withCalmPet,
            withNonObedientPet: adoption_request_data.psychologicalData.withNonObedientPet,
            withUnwantedPetWaste: adoption_request_data.psychologicalData.withUnwantedPetWaste,
            withAggressivePet: adoption_request_data.psychologicalData.withAggressivePet,
            withBigPet: adoption_request_data.psychologicalData.withBigPet,
            withSmallPet: adoption_request_data.psychologicalData.withSmallPet
        });

        await newAdoptionRequest.setApplicantsPsychologicalData(newApplicantsPsychologicalData);

        //MASCOTAS ANTERIORES
        for await (previous_pet_data of adoption_request_data.previousPets) {
            const newPreviousPet = await PreviousPet.create({
                id: generateId(),
                name: previous_pet_data.name,
                isAlive: previous_pet_data.isAlive,
                stillPreserved: previous_pet_data.stillPreserved,
                age: previous_pet_data.age,
                species: previous_pet_data.species,
                details: previous_pet_data.details
            });

            //VACUNAS DE CADA MASCOTA ANTERIOR
            for await (previous_pet_vaccine_data of previous_pet_data.vaccines) {
                const newPreviousPetVaccine = await PreviousPetsVaccine.create({
                    id: generateId(),
                    name: previous_pet_vaccine_data.name,
                    appliedOn: previous_pet_vaccine_data.appliedOn
                });

                await newPreviousPet.addPreviousPetVaccine(newPreviousPetVaccine);
            }

            await newAdoptionRequest.addPreviousPet(newPreviousPet);
        }

        //RESIDENCIA ACTUAL (Y SI SE VA A MUDAR, NUEVA RESIDENCIA)
        for await (applicants_residence_data of adoption_request_data.applicantsResidences) {
            const newApplicantsResidence = await ApplicantsResidence.create({
                id: generateId(),
                actualResidence: applicants_residence_data.actualResidence,
                type: applicants_residence_data.type,
                ownHouse: applicants_residence_data.ownHouse,
                homeownerName: applicants_residence_data.homeownerName,
                homeownerSurname: applicants_residence_data.homeownerSurname,
                homeownerPhoneNumber: applicants_residence_data.homeownerPhoneNumber,
                withPatio: applicants_residence_data.withPatio,
                withTerrace: applicants_residence_data.withTerrace,
                withGarden: applicants_residence_data.withGarden,
                coveredPetArea: applicants_residence_data.coveredPetArea,
                petAreaDimension: applicants_residence_data.petAreaDimension
            });

            await newAdoptionRequest.addApplicantsResidence(newApplicantsResidence);
        }

        //REFERENCIAS PERSONALES
        for await (personal_reference_data of adoption_request_data.personalReferences) {
            const newPersonalReference = await PersonalReference.create({
                id: generateId(),
                name: personal_reference_data.name,
                surname: personal_reference_data.surname,
                age: personal_reference_data.age,
                email: personal_reference_data.email,
                phoneNumber: personal_reference_data.phoneNumber,
                hasAJob: personal_reference_data.hasAJob,
                occupation: personal_reference_data.occupation,
                relationship: personal_reference_data.relationship
            });

            await newAdoptionRequest.addPersonalReference(newPersonalReference);
        }

        //INQUILINOS RESIDENTES
        for await (residences_tenant_data of adoption_request_data.residencesTenants) {
            const newResidencesTenant = await ResidencesTenant.create({
                id: generateId(),
                name: residences_tenant_data.name,
                surname: residences_tenant_data.surname,
                allergies: residences_tenant_data.allergies
            });

            //DATOS PSICOLOGICOS DE CADA INQUILINO
            const newTenantPsychologicalData = await TenantsPsychologicalData.create({
                id: generateId(),
                withNoisyPet: residences_tenant_data.psychologicalData.withNoisyPet,
                withHyperactivePet: residences_tenant_data.psychologicalData.withHyperactivePet,
                withCalmPet: residences_tenant_data.psychologicalData.withCalmPet,
                withNonObedientPet: residences_tenant_data.psychologicalData.withNonObedientPet,
                withUnwantedPetWaste: residences_tenant_data.psychologicalData.withUnwantedPetWaste,
                withAggressivePet: residences_tenant_data.psychologicalData.withAggressivePet,
                withBigPet: residences_tenant_data.psychologicalData.withBigPet,
                withSmallPet: residences_tenant_data.psychologicalData.withSmallPet
            });

            await newResidencesTenant.setTenantPsychologicalData(newTenantPsychologicalData);
            await newAdoptionRequest.addResidencesTenant(newResidencesTenant);
        }

        const user = await Usuario.findByPk(user_id);
        const pet = await Animal.findByPk(pet_id);
        const name = user.dataValues.name
        const email = user.dataValues.email
        const petName = pet.dataValues.name
        const petImage = pet.dataValues.image
        const imageHuellitas = "https://lh3.googleusercontent.com/a/AEdFTp5y03Rs5TO_QAPI1GvXO0MXwrwxc5GnifUN53Xp=s96-c-rg-br100"
        const fecha = new Date()

        user.setAdoptionRequest(newAdoptionRequest);
        pet.setAdoptionRequest(newAdoptionRequest);

        user.hasAdoptionRequest = true;
        user.save();
        
        pet.isAdopted = true,
        pet.save();
        // console.log(email)
        // console.log(name)
        // console.log(petName)
        // console.log(fecha)
        // console.log(petImage)
        //console.log(user)
        // console.log(pet)
        await transporter.sendMail({
            from: '"Huellitas" <hdeamor2023@gmail.com>', // sender address
            to: email, // list of receivers
            subject: `Solicitud de adopción`, // Subject line
            html: `<!DOCTYPE html>
            <html>
            <body>
            <h1>Gracias por mostrar interes en ${petName} seguro se pondrá feliz</h1>
            <img src = ${petImage} alt ="Mascota">
            <h4>Estaremos en contacto para agendar una cita según tu calendario</h4>
            <h3>Fecha y hora de radicación del formulario: ${fecha}</h3>
            <h6>No responder a este mensaje</h6>
            <img src=${imageHuellitas} alt="Huellitas de amor">
            </body>
            </html>`, // html body
        });



        res.status(200).json(await AdoptionRequest.findByPk(adoptionRequestId, {
            include: [{
                model: TenantsPsychologicalData,
                as: "applicantsPsychologicalData"
            }, {
                model: PreviousPet,
                as: "previousPet",
                include: [{
                    model: PreviousPetsVaccine,
                    as: "previousPetVaccine"
                }]
            }, {
                model: ApplicantsResidence,
                as: "applicantsResidence"
            }, {
                model: PersonalReference,
                as: "personalReference"
            }, {
                model: ResidencesTenant,
                as: "residencesTenant",
                include: [{
                    model: TenantsPsychologicalData,
                    as: "tenantPsychologicalData"
                }]
            }],

        }));
    } catch (error) {
        console.log(error.message);
        res.status(404).json({ error: error.message });
    }
}

const getAdoptionRequestById = async (req, res) => {
    try {
        const { id } = req.params;

        const adoption_request = await AdoptionRequest.findByPk(id, {
            include: [{
                model: TenantsPsychologicalData,
                as: "applicantsPsychologicalData"
            }, {
                model: PreviousPet,
                as: "previousPet",
                include: [{
                    model: PreviousPetsVaccine,
                    as: "previousPetVaccine"
                }]
            }, {
                model: ApplicantsResidence,
                as: "applicantsResidence"
            }, {
                model: PersonalReference,
                as: "personalReference"
            }, {
                model: ResidencesTenant,
                as: "residencesTenant",
                include: [{
                    model: TenantsPsychologicalData,
                    as: "tenantPsychologicalData"
                }]
            }],

        });

        res.status(200).json(adoption_request);

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

const getAllAdoptionRequests = async (req, res) => {

}

const authorizeAdoptionRequest = async (req, res) => {
    try {
        const { id } = req.params;

        const adoption_request = await AdoptionRequest.findByPk(id, {
            include: [
                {
                    model: Usuario,
                    as: "applicant"
                },
                {
                    model: Animal,
                    as: "toBeAdopted"
                }
                ,
                {
                    model: TenantsPsychologicalData,
                    as: "applicantsPsychologicalData"
                }, {
                    model: PreviousPet,
                    as: "previousPet",
                    include: [{
                        model: PreviousPetsVaccine,
                        as: "previousPetVaccine"
                    }]
                }, {
                    model: ApplicantsResidence,
                    as: "applicantsResidence"
                }, {
                    model: PersonalReference,
                    as: "personalReference"
                }, {
                    model: ResidencesTenant,
                    as: "residencesTenant",
                    include: [{
                        model: TenantsPsychologicalData,
                        as: "tenantPsychologicalData"
                    }]
                }],

        });

        const userEmail = adoption_request.applicant.email;
        const userName = adoption_request.applicant.name;
        const petName = adoption_request.toBeAdopted.name;
        const petImage = adoption_request.toBeAdopted.image;
        let emailHTML = approvedAdoptionRequestEmailTemplate.replaceAll("{pet_name}", petName);
        emailHTML = emailHTML.replaceAll("{user_name}", userName);
        emailHTML = emailHTML.replaceAll("{pet_image}", petImage);

        const adoptionRequestToDestroy = adoption_request.id;
        const personalReferenceToDestroy = [];
        const previousPetToDestroy = [];
        const vaccinesToDestroy = [];
        const residencesTenantToDestroy = [];
        const psychologicalDataToDestroy = [];
        const applicantsResidenceToDestroy = [];

        psychologicalDataToDestroy.push(adoption_request.applicantsPsychologicalData.id);

        adoption_request.personalReference.forEach(pr => {
            personalReferenceToDestroy.push(pr.id);
        });

        adoption_request.previousPet.forEach(pp => {
            previousPetToDestroy.push(pp.id);

            pp.previousPetVaccine.forEach(v => {
                vaccinesToDestroy.push(v.id);
            });
        });

        adoption_request.residencesTenant.forEach(rt => {
            residencesTenantToDestroy.push(rt.id);
            psychologicalDataToDestroy.push(rt.tenantPsychologicalData.id);
        });

        adoption_request.applicantsResidence.forEach(ar => {
            applicantsResidenceToDestroy.push(ar.id);
        });

        adoption_request.applicant.hasAdoptionRequest = false;
        adoption_request.toBeAdopted.isAdopted = true;
        adoption_request.applicant.save();
        adoption_request.toBeAdopted.save();

        adoption_request.applicant.setAdoptionRequest(null);
        adoption_request.toBeAdopted.setAdoptionRequest(null);

        for await (let toDestroy of vaccinesToDestroy){
            await PreviousPetsVaccine.destroy({
                where: {
                    id: toDestroy
                },
                force: true
            })
        }

        for await (let toDestroy of previousPetToDestroy){
            await PreviousPet.destroy({
                where: {
                    id: toDestroy
                },
                force: true
            })
        }

        for await (let toDestroy of personalReferenceToDestroy){
            await PersonalReference.destroy({
                where: {
                    id: toDestroy
                },
                force: true
            })
        }

        for await (let toDestroy of psychologicalDataToDestroy){
            await TenantsPsychologicalData.destroy({
                where: {
                    id: toDestroy
                },
                force: true
            })
        }

        for await (let toDestroy of residencesTenantToDestroy){
            await ResidencesTenant.destroy({
                where: {
                    id: toDestroy
                },
                force: true
            })
        }

        for await (let toDestroy of applicantsResidenceToDestroy){
            await ApplicantsResidence.destroy({
                where: {
                    id: toDestroy
                },
                force: true
            })
        }

        await AdoptionRequest.destroy({
            where: {
                id: adoptionRequestToDestroy
            },
            force: true
        });

        await transporter.sendMail({
            from: '"Huellitas" <hdeamor2023@gmail.com>', // sender address
            to: userEmail, // list of receivers
            subject: `Solicitud de adopción aprobada`, // Subject line
            html: emailHTML, // html body
        });

        res.status(200).json({ message: "ok" });
    } catch (error) {
        res.status(400).json(error);
    }
}

const sendRequestDataReviewEmail = async (req, res) => {
    try{
        const {userId, emailHTML} = req.body;
        const user = await Usuario.findByPk(userId);

        if(user){
            await transporter.sendMail({
                from: '"Huellitas" <hdeamor2023@gmail.com>', // sender address
                to: user.email, // list of receivers
                subject: `Solicitud de adopción en espera`, // Subject line
                html: emailHTML, // html body
            });
            
            res.status(200).send("ok");
        } else {
            res.status(404).send({error: "User with id not found"});
        }
    } catch (error){
        res.status(400).json({error: error.message});
    }
}

const rejectAdoptionRequest = async (req, res) => {
    try{
        const {userId, emailHTML} = req.body;
        const user = await Usuario.findByPk(userId);

        if(user){
            await transporter.sendMail({
                from: '"Huellitas" <hdeamor2023@gmail.com>', // sender address
                to: user.email, // list of receivers
                subject: `Solicitud de adopción rechazada`, // Subject line
                html: emailHTML, // html body
            });
            
            res.status(200).send("ok");
        } else {
            res.status(404).send({error: "User with id not found"});
        }
    } catch (error){
        res.status(400).json({error: error.message});
    }
}

module.exports = {
    postAdoptionRequest,
    getAdoptionRequestById,
    getAllAdoptionRequests,
    authorizeAdoptionRequest,
    sendRequestDataReviewEmail,
    rejectAdoptionRequest
};
