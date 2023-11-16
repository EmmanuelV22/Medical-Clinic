const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const connectDB = require("../server");
const jwtSecret =
  "0ea83a262f8efb25346b0cd612af54572067b23c4942bd11d57b1a9f7c97912a7fd432";
const { v4: uuidv4 } = require("uuid");

/*************************************************************
 * ********** AUTH EMPLOYEES *************************************
 **********************************************************/

exports.getEmployeeById = async (req, res, next) => {
  const { id } = req.params; // Je suppose que l'ID est dans les paramètres de l'URL

  const query = "SELECT * FROM employees WHERE id = ?";
  const values = [id];

  connectDB.query(query, values, (error, results, fields) => {
    if (error) {
      return res
        .status(400)
        .json({ message: "Error fetching patient", error: error.message });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const employee = results[0];
    return res.status(200).json({ employee });
  });
};

////////////////////////////////////////////////

exports.getAllEmployees = (req, res, next) => {
  const query = "SELECT * FROM employees"; // Définis ta requête SQL ici

  connectDB.query(query, (error, results, fields) => {
    if (error) {
      res
        .status(400)
        .json({ message: "Error employees not found", error: error.message });
      return;
    }

    res.status(200).json(results); // Envoie les résultats en réponse
  });
};

////////////////////////////////////////////////////////////

exports.register = async (req, res, next) => {
  const { firstname, lastname, email, address, dni, specialist, password , personalID } =
    req.body;
  const createdAt = new Date().toISOString().split("T")[0];
  // const personalID = uuidv4().substr(0, 10);

  bcrypt.hash(password, 10, async (err, hash) => {
    if (err) {
      return res.status(500).json({ message: "Error hashing password" });
    }

    const query =
      "INSERT INTO employees (firstname, lastname, email, address, dni, specialist, personalID, createdAt, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
    const values = [
      firstname,
      lastname,
      email,
      address,
      dni,
      specialist,
      personalID,
      createdAt,
      hash,
    ];

    connectDB.query(query, values, (error, results, fields) => {
      if (error) {
        return res
          .status(400)
          .json({ message: "Error creating user", error: error.message });
      }

      const maxAge = 3 * 60 * 60;
      const token = jwt.sign(
        {
          firstname,
          lastname,
          email,
          address,
          dni,
          specialist,
          personalID,
          createdAt,
        },
        jwtSecret,
        {
          expiresIn: maxAge,
        }
      );

      res.cookie("jwt", token, {
        httpOnly: true,
        maxAge: maxAge * 1000,
      });

      res.status(201).json({
        message: "Employee successfully created",
        employee: results.insertId,
      });
    });
  });
};

///////////////////////////////////////////////////

exports.login = async (req, res, next) => {
  const { personalID, password } = req.body;
  console.log(req.body);
  const query = "SELECT * FROM employees WHERE personalID = ?";
  const values = [personalID];

  connectDB.query(query, values, (error, results, fields) => {
    if (error) {
      return res
        .status(400)
        .json({ message: "Error fetching employee", error: error.message });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "Employee not found" });
    }

    const employee = results[0];

    bcrypt.compare(password, employee.password, (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Error comparing passwords" });
      }

      if (result) {
        const maxAge = 3 * 60 * 60;
        const token = jwt.sign(
          {
            id: employee.id,
            dni: employee.dni,
            email: employee.email,
            firstname: employee.firstname,
            lastname: employee.lastname,
            specialist: employee.specialist,
            address: employee.address,
            personalID: employee.personalID,
          },
          jwtSecret,
          {
            expiresIn: maxAge,
          }
        );
        res.cookie("jwt", token, {
          httpOnly: true,
          maxAge: maxAge * 1000,
        });
        return res.status(201).json({
          message: "Employee successfully Logged in",
          employee: {
            id: employee.id,
            dni: employee.dni,
            email: employee.email,
            firstname: employee.firstname,
            lastname: employee.lastname,
            specialist: employee.specialist,
            address: employee.address,
            personalID: employee.personalID,
            createdAt: employee.createdAt,
          },
          token: token,
        });
      } else {
        return res.status(400).json({ message: "Login not successful" });
      }
    });
  });
};

/////////////////////////////////////////////////////////////////////////////////////

exports.update = async (req, res, next) => {
  const { firstname, lastname, email, address, dni, specialist, id } = req.body;
  const updatedAt = new Date();
  const query =
    "UPDATE employees SET firstname = ?, lastname = ?, email = ?, dni = ?, specialist = ?, address = ?, updatedAt = ? WHERE id = ?";
  const values = [
    firstname,
    lastname,
    email,
    dni,
    specialist,
    address,
    updatedAt,
    id,
  ];

  connectDB.query(query, values, (error, result, fields) => {
    if (error) {
      return res
        .status(400)
        .json({ message: "Error updating user", error: error.message });
    }

    return res.status(201).json({
      message: "Employee successfully updated",
      employee: id, // Cambiado a 'id' en lugar de 'user.id'
    });
  });
};

//////////////////////////////////////////////////////////////////////

exports.deleteUser = async (req, res, next) => {
  const { id } = req.body;
  const query = "DELETE FROM employees WHERE id = ?";
  const values = [id];
  connectDB.query(query, values, (error, results, fields) => {
    if (error) {
      return res
        .status(400)
        .json({ message: "Error delete", error: message.error });
    }
    return res.status(200).json({ message: "User successfully deleted" });
  });
};

/*************************************************************
 * ********** AUTH PATIENTS *************************************
 **********************************************************/

exports.getPatientById = async (req, res, next) => {
  const { id } = req.params; // Je suppose que l'ID est dans les paramètres de l'URL

  const query = "SELECT * FROM patients WHERE id = ?";
  const values = [id];

  connectDB.query(query, values, (error, results, fields) => {
    if (error) {
      return res
        .status(400)
        .json({ message: "Error fetching patient", error: error.message });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const patient = results[0];
    return res.status(200).json({ patient });
  });
};

////////////////////////////////////////////////////////
exports.getAllPatients = async (req, res, next) => {
  const query = "SELECT * FROM patients";
  connectDB.query(query, (error, results, fields) => {
    if (error) {
      res
        .status(400)
        .json({ message: "Error, patients not found", error: error.message });
      return;
    }
    res.status(200).json({ results });
  });
};
//////////////////////////////////////////////////////////

exports.registerPatient = async (req, res, next) => {
  const { firstname, lastname, email, address, dni, birthday, password , blood_group } =
    req.body;
  const createdAt = new Date().toISOString().split("T")[0];

  bcrypt.hash(password, 10, async (err, hash) => {
    if (err) {
      return res.status(500).json({ message: "Error hashing password" });
    }

    const query =
      "INSERT INTO patients (firstname, lastname, email, address, dni, birthday, password, blood_group, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
    const values = [
      firstname,
      lastname,
      email,
      address,
      dni,
      birthday,
      hash,
      blood_group,
      createdAt,
    ];

    connectDB.query(query, values, (error, results, fields) => {
      if (error) {
        return res
          .status(400)
          .json({ message: "Error creating patient", error: error.message });
      }

      const maxAge = 3 * 60 * 60;
      const token = jwt.sign(
        {
          firstname,
          lastname,
          email,
          address,
          dni,
          birthday,
          createdAt,
        },
        jwtSecret,
        {
          expiresIn: maxAge,
        }
      );

      res.cookie("jwt", token, {
        httpOnly: true,
        maxAge: maxAge * 1000,
      });

      res.status(201).json({
        message: "Patient successfully created",
        patient: results.insertId,
      });
    });
  });
};

///////////////////////////////////////////////

exports.loginPatient = async (req, res, next) => {
  const { dni, password } = req.body;

  const query = "SELECT * FROM patients WHERE dni = ?";
  const values = [dni];

  connectDB.query(query, values, (error, results, fields) => {
    if (error) {
      return res
        .status(400)
        .json({ message: "Error patient login", error: error.message });
    }
    if (results.length === 0) {
      return res
        .status(400)
        .json({ message: "Patient not found", error: error.message });
    }
    const patient = results[0];

    bcrypt.compare(password, patient.password, (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Error comparing passwords" });
      }
      if (result) {
        const maxAge = 3 * 60 * 60;
        const token = jwt.sign(
          {
            id: patient.id,
            firstname: patient.firstname,
            lastname: patient.lastname,
            dni: patient.dni,
            email: patient.email,
            address: patient.address,
            birthday: patient.birthday,
            createdAt: patient.createdAt,
          },
          jwtSecret,
          {
            expiresIn: maxAge,
          }
        );
        res.cookie("jwt", token, {
          httpOnly: true,
          maxAge: maxAge * 1000,
        });
        return res.status(201).json({
          message: "Patient successfully logged",
          id: patient.id,
          firstname: patient.firstname,
          lastname: patient.lastname,
          dni: patient.dni,
          email: patient.email,
          address: patient.address,
          birthday: patient.birthday,
          createdAt: patient.createdAt,
          token: token,
        });
      } else {
        return res.status(400).json({ message: "Login not successful" });
      }
    });
  });
};

///////////////////////////////////////////////////

exports.updatePatient = async (req, res, next) => {
  const { firstname, lastname, email, dni, address, password, id, birthday } =
    req.body;
  const updatedAt = new Date();
  const query =
    "UPDATE patients SET firstname = ?, lastname = ?, email = ?, dni = ?, address = ?, password = ?, birthday = ?, updatedAt = ? WHERE id = ?";
  const values = [
    firstname,
    lastname,
    email,
    dni,
    address,
    password,
    birthday,
    updatedAt,
    id,
  ];
  connectDB.query(query, values, (error, results, fields) => {
    if (error) {
      return res
        .status(400)
        .json({ message: "Error Updating Patient ", error: error.message });
    }

    return res
      .status(201)
      .json({ message: "Patient successfully updated", patient: id });
  });
};

exports.deletePatient = async (req, res, next) => {
  const { id } = req.body;
  const query = "DELETE FROM patients WHERE id = ?";
  const values = [id];
  connectDB.query(query, values, (error, results, fields) => {
    if (error) {
      return res
        .status(400)
        .json({ message: "Error deleting patient", error: error.message });
    }
    return res.status(201).json({ message: "Patient successfully deleted" });
  });
};