/*
 * index.js
 * Project: Patient Clinical Data RESTful API
 * Authors: 
 *      KAMALPREET SINGH   300976062
 *      MEHMET FATIH INAN  300966544
 *      ROBERT ARGUME      300949529
 * version: 1.0.0
 * Description: RESTful API for managing a patient clinical data 
 * Curl example:
 *   - curl -d '{"FirstName":"John", "LastName":"Doe"}' -H "Content-Type: application/json" -X POST http://127.0.0.1:8000/patients
 */

let SERVER_NAME = 'patient-clinical-data-api'
let PORT = 8000
let HOST = '127.0.0.1'

let restify = require('restify')

  // Get a persistence engine for the patients and their clinical data
  , patientsSave = require('save')('patients')
  , clinicalDataSave = require('save')('clinical-data')

  // Create the restify server
  , server = restify.createServer({ name: SERVER_NAME})

  server.listen(PORT, HOST, function () {
  console.log('Server %s listening at %s', server.name, server.url)
  console.log('Resources:')
  console.log(' /patients        method: GET')
  console.log(' /patients        method: POST')
  console.log(' /patients/:id    method: GET')  
  console.log(' /patients/:id    method: PUT')
  console.log(' /patients/:id    method: DEL')  
})

server
  // Allow the use of POST
  .use(restify.fullResponse())

  // Maps req.body to req.params so there is no switching between them
  .use(restify.bodyParser())


//#region PATIENT API

// Get all patients in the system
server.get('/patients', function (req, res, next) {

  // Find every patient within the given collection
  patientsSave.find({}, function (error, patients) {

    // Return all of the patients in the system
    res.send(patients)
  })
})

// Get a single patient by their patient id
server.get('/patients/:id', function (req, res, next) {

  // Find a single patient by their id within save
  patientsSave.findOne({ _id: req.params.id }, function (error, patient) {

    // If there are any errors, pass them to next in the correct format
    if (error) return next(new restify.InvalidArgumentError(JSON.stringify(error.errors)))

    if (patient) {
      // Send the patient if no issues
      res.send(user)
    } else {
      // Send 404 header if the patient doesn't exist
      res.send(404)
    }
  })
})

// Create a new patient
server.post('/patients', function (req, res, next) {
  // Get new patient data from the request object
  let newPatient = ''
  try {
      newPatient = getPatientData(req)
  } catch (error) {
      return next(new restify.InvalidArgumentError(JSON.stringify(error.message)))
  }

  // Create the patient using the persistence engine
  patientsSave.create( newPatient, function (error, patient) {

    // If there are any errors, pass them to next in the correct format
    if (error) return next(new restify.InvalidArgumentError(JSON.stringify(error.errors)))

    // Send the patient if no issues
    res.send(201, patient)
  })
})

// Update a patient by their id
server.put('/patients/:id', function (req, res, next) {
  // Ge patient updated data and create a new patient object
  let updatedPatient = getPatientData(req)
  newPatupdatedPatientient._id = req.params.id
  
  // Update the patient with the persistence engine
  patientsSave.update(updatedPatient, function (error, patient) {

    // If there are any errors, pass them to next in the correct format
    if (error) return next(new restify.InvalidArgumentError(JSON.stringify(error.errors)))

    // Send a 200 OK response
    res.send(200)
  })
})

// Delete patient with the given id
server.del('/patients/:id', function (req, res, next) {

  // Delete the patient with the persistence engine
  patientsSave.delete(req.params.id, function (error, patient) {

    // If there are any errors, pass them to next in the correct format
    if (error) return next(new restify.InvalidArgumentError(JSON.stringify(error.errors)))

    // Send a 200 OK response
    res.send()
  })
})
//#endregion

//#region  PRIVATE METHODS
function getPatientData(req){
  // Make sure first name, last name, date of birth, insurance plan and blood type are defined
  if (req.params.FirstName === undefined) {
    throw new Error('FirstName must be supplied')
  }
  if (req.params.LastName === undefined) {
    throw new Error('LastName must be supplied')
  }
  if (req.params.DateOfBirth === undefined) {
    throw new Error('DateOfBirth must be supplied')
  }
  if (req.params.Telephone === undefined) {
    throw new Error('Telephone must be supplied')
  }
  if (req.params.InsurancePlan === undefined) {
    throw new Error('InsurancePlan must be supplied')
  }
  if (req.params.BloodType === undefined) {
    throw new Error('BloodType must be supplied')
  }

   // All other pieces of information that are not mandatory and are not defined will be empty or false
  if (req.params.Address === undefined ) {
    req.params.Address = '';
  }
  if (req.params.IsInCritcalCondition === undefined || !req.params.IsInCritcalCondition || req.params.IsInCritcalCondition.toLowerCase() == 'no') {
    req.params.IsInCritcalCondition = false;
  }
  else {
    req.params.IsInCritcalCondition = true;
  }

  let newPatient = {
		FirstName: req.params.FirstName, 
    LastName: req.params.LastName,
    Address: req.params.Address,
    DateOfBirth: req.params.DateOfBirth,
    Telephone: req.params.Telephone,
    InsurancePlan: req.params.InsurancePlan,
    BloodType: req.params.BloodType,
    EmergencyContact: req.params.EmergencyContact === undefined ? '' : getEmergencyContactData(req.params.EmergencyContact),
    IsInCritcalCondition: req.params.IsInCritcalCondition
  }

  return newPatient
}

function getEmergencyContactData(contactData){
  if (contactData.Name === undefined) {
      contactData.Name = ''
  }
  if (contactData.Address === undefined) {
    contactData.Address = ''
  }
  if (contactData.Relationship === undefined) {
    contactData.Relationship = ''
  }
  if (contactData.Telephone === undefined) {
    contactData.Telephone = ''
  }

  let newEmergencyContact = {
      Name: contactData.Name,
      Address: contactData.Address,
      Relationship: contactData.Relationship,
      Telephone: contactData.Telephone 
  }

  return newEmergencyContact;
}
//#endregion

//#region JSON EXAMPLES 
let patientDataExample = 
{
    "FirstName": "John",
    "LastName": "Doe",
    "Address": "345 Yonge Street",
    "DateOfBirth": "11-27-2017",
    "Telephone": "416-345-9033",
    "InsurancePlan": "BlueCross - 202",
        "EmergencyContact": {
        "Name": "Jane Doe",
        "Address": "",
        "Relationship": "wife",
        "Telephone": "416-222-7755" 
    },
    "BloodType": "A+",
    "IsInCritcalCondition": "No"    // or false
}

let clinicalDataExample =
{
    "PatientID": "567",
    "Practitioner": "Amanda Fox",
    "DateTime": "10/10/2017 10:35 am",
    "DataType": "Temperature",
    "Reading": "37.2"
}
  
//#endregion