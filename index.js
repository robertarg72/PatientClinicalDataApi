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
//let PORT = 8000
let PORT = process.env.PORT || 8000
//let HOST = '127.0.0.1'

let restify = require('restify')

  // Get a persistence engine for the patients and their clinical data
  , patientsSave = require('save')('patients')
  , clinicalDataSave = require('save')('clinical-data')

  // Create the restify server
  , server = restify.createServer({ name: SERVER_NAME})

//server.listen(PORT, HOST, function () {
  server.listen(PORT, function () {
  console.log('Server %s listening at %s', server.name, server.url)
  console.log('Resources:')
  console.log(' /patients        method: GET')
  console.log(' /patients        method: POST')
  console.log(' /patients/:id    method: GET')  
  console.log(' /patients/:id    method: PUT')
  console.log(' /patients/:id    method: DEL')
  console.log(' /patients/criticalCondition         method: GET')  
  console.log(' /patients/:patientId/records        method: GET')
  console.log(' /patients/:patientId/records        method: POST')
  console.log(' /patients/:patientId/records/:id    method: GET')
  console.log(' /patients/:patientId/records/:id    method: PUT')
  console.log(' /patients/:patientId/records/:id    method: DEL')
})

server
  // Allow the use of POST
  .use(restify.fullResponse())

  // Maps req.body to req.params so there is no switching between them
  .use(restify.bodyParser())

// Catch all other routes and return a default message
server.get('/', function (req, res, next) {
  res.send('Patient RESTful API')
});

//#region PATIENT API

// Get all patients in the system
server.get('/patients', function (req, res, next) {

  // Find every patient within the given collection
  patientsSave.find({}, function (error, patients) {

    // Return all of the patients in the system
    res.send(patients)
  })
})

// Get all patients in critical condition in the system
server.get('/patients/criticalCondition', function (req, res, next) {
  
    // Find every patient within the given collection
    patientsSave.find({IsInCritcalCondition: true}, function (error, patients) {
  
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
  updatedPatient._id = req.params.id
  
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
    // Find every clinical data record that belongs to this patient
    clinicalDataSave.find({PatientID: req.params.id}, function (error, records) {
       
        // First Delete every clinical data record 
        records.forEach(function(record, index){

            // Delete the record with the persistence engine
            clinicalDataSave.delete(record._id, function (error, deletedRecord) {
                // If there are any errors, pass them to next in the correct format
                if (error) return next(new restify.InvalidArgumentError(JSON.stringify(error.errors)))
            })
            console.log("All Clinical data for patientId=" + record.PatientID + " DELETED")
        })

        // Now Delete the patient with the persistence engine
        patientsSave.delete(req.params.id, function (error, patient) {
          // If there are any errors, pass them to next in the correct format
          if (error) return next(new restify.InvalidArgumentError(JSON.stringify(error.errors)))
      
          // Send a 200 OK response
          res.send()
        })
        
    })
})
//#endregion

//#region CLINICAL DATA API
// Get all clinical data for a specific patient in the system
server.get('/patients/:id/records', function (req, res, next) {
  
    // Find every clinical data record that belongs to the pateint within the given collection
    clinicalDataSave.find({PatientID: req.params.id}, function (error, records) {
  
    // Return all of the clinical data records for the patient
    res.send(records)
    })
  })
  
  // Get a single clinical data record for a specific patient 
  server.get('/patients/:patientId/records/:id', function (req, res, next) {
  
    // Find a single clinical data record from the save, based on recordId and patientId
    clinicalDataSave.findOne({ _id: req.params.id, PatientID: req.params.patientId }, function (error, record) {
  
      // If there are any errors, pass them to next in the correct format
      if (error) return next(new restify.InvalidArgumentError(JSON.stringify(error.errors)))
  
      if (record) {
        // Send the record if no issues
        res.send(record)
      } else {
        // Send 404 header if the record doesn't exist
        res.send(404)
      }
    })
  })
  
  // Create a new clinical data record for a specific patient
  server.post('/patients/:patientId/records', function (req, res, next) {
    // Get new clinical data from the request object
    let newRecord = ''
    try {
        newRecord = getClinicalData(req)
    } catch (error) {
        return next(new restify.InvalidArgumentError(JSON.stringify(error.message)))
    }
  
    // Create the record using the persistence engine
    clinicalDataSave.create( newRecord, function (error, record) {
  
      // If there are any errors, pass them to next in the correct format
      if (error) return next(new restify.InvalidArgumentError(JSON.stringify(error.errors)))
  
      // Send the record if no issues
      res.send(201, record)
    })
  })
  
  // Update a specific patient's clinical data record by their id
  server.put('/patients/:patientId/records/:id', function (req, res, next) {
    // Ge patient updated data and create a new patient object
    let updatedRecord = getClinicalData(req)
    updatedRecord._id = req.params.id
    updatedRecord.PatientID = req.params.patientId
    
    // Update the record with the persistence engine
    clinicalDataSave.update(updatedRecord, function (error, record) {
  
      // If there are any errors, pass them to next in the correct format
      if (error) return next(new restify.InvalidArgumentError(JSON.stringify(error.errors)))
  
      // Send a 200 OK response
      res.send(200)
    })
  })
  
  // Delete a specific patient's clinical data record by using both patient id and record id
  server.del('/patients/:patientId/records/:id', function (req, res, next) {
  
    //TODO: Check delete logic. It seems we dont need the patientId
    // Delete the record with the persistence engine
    clinicalDataSave.delete(req.params.id, function (error, record) {
  
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


function getClinicalData(req){
  // Make sure Practitioner, DateTime, DataType and Reading are defined
  if (req.params.Practitioner === undefined) {
    throw new Error('Practitioner must be supplied')
  }
  if (req.params.DateTime === undefined) {
    throw new Error('DateTime must be supplied')
  }
  if (req.params.DataType === undefined) {
    throw new Error('DataType must be supplied')
  }
  if (req.params.Reading === undefined) {
    throw new Error('Reading must be supplied')
  }
 
  let record = {
		PatientID: req.params.patientId, 
    Practitioner: req.params.Practitioner,
    DateTime: req.params.DateTime,
    DataType: req.params.DataType,
    Reading: req.params.Reading
  }

  return record
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