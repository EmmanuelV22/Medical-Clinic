/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useEffect, useState } from "react";
import { Context } from "../../store/appContext";
import SortingTable from "../../components/SortingTable";
import SearchBar from "../../components/SearchBar";

const MyAppointments = () => {
  const { store, actions } = useContext(Context);
  const doctorID = store.employee ? store.employee.id : null;
  const [searchError, setSearchError] = useState(false);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [appointmentStatus, setAppointmentStatus] = useState({});
  const [sortedAppointments, setSortedAppointments] = useState([]);

  const filteredPatients = store.patients.filter((patient) =>
    store.myAppointments.some(
      (appointment) => appointment.patient_id === patient.id
    )
  );

  const getMyAppointments = async () => {
    if (doctorID) {
      await actions.loadMedicalAppointmentsForDr(doctorID);
      actions.getAllPatients();

      // Tri des rendez-vous par ordre chronologique
      const sortedAppointments = [...store.myAppointments].sort((a, b) => {
        // Convertir les dates en objets Date pour la comparaison
        const dateA = new Date(`${a.year}-${a.month}-${a.date} ${a.time}`);
        const dateB = new Date(`${b.year}-${b.month}-${b.date} ${b.time}`);

        return dateA - dateB;
      });

      setSortedAppointments(sortedAppointments);
    }
  };

  useEffect(() => {
    if (doctorID !== null) {
      getMyAppointments();
    }
  }, [doctorID]);

  const headers = [
    { field: "date", label: "Fecha", sortable: false },
    { field: "time", label: "Hora", sortable: false },
    {
      field: "patient.firstname",
      label: "Nombre del Paciente",
      sortable: false,
    },
    {
      field: "patient.lastname",
      label: "Apellido del Paciente",
      sortable: false,
    },
    { field: "patient.dni", label: "DNI del Paciente", sortable: false },
    { field: "patient.email", label: "Email del Paciente", sortable: false },
    { field: "actions", label: "Estado", sortable: false },
  ];

  const updateAppointmentState = async (appointmentId, newState) => {
    try {
      await actions.updateAppointmentState(appointmentId, newState);
      // Rechargez les rendez-vous après la mise à jour de l'état
      actions.loadMedicalAppointmentsForDr(doctorID);
      window.location.reload();
    } catch (error) {
      console.log("Error updating appointment state:", error);
    }
  };

  const handleConfirmation = async (appointmentId) => {
    // Mettez à jour l'état pour la confirmation
    await updateAppointmentState(appointmentId, "asistido");
    setAppointmentStatus((prevStatus) => ({
      ...prevStatus,
      [appointmentId]: "asistido",
    }));
  };

  const handleCancellation = async (appointmentId) => {
    // Mettez à jour l'état pour l'annulation
    await updateAppointmentState(appointmentId, "no asistido");
    setAppointmentStatus((prevStatus) => ({
      ...prevStatus,
      [appointmentId]: "no asistido",
    }));
  };

  const renderRow = (appointment) => {
    // Formater le jour avec deux chiffres
    const formattedDay = String(appointment.date).padStart(2, "0");

    return (
      <React.Fragment key={appointment.id}>
        <tr className="infos-contain">
          <td>
            {formattedDay}/{appointment.month}/{appointment.year}
          </td>
          <td>{appointment.time}</td>
          {filteredPatients
            .filter((patient) => appointment.patient_id === patient.id)
            .map((patient) => (
              <React.Fragment key={patient.id}>
                <td>{patient.firstname}</td>
                <td>{patient.lastname}</td>
                <td>{patient.dni}</td>
                <td>{patient.email}</td>
                {appointment.state === "asistido" && <td>Asistido</td>}
                {appointment.state === "no asistido" && <td>No asistido</td>}
                {appointment.state !== "asistido" &&
                  appointment.state !== "no asistido" && (
                    <td style={{ margin: "auto" }}>
                      <button
                        style={{
                          border: "none",
                          background: "transparent",
                          color: "green",
                        }}
                        title="confirmar"
                        onClick={() => handleConfirmation(appointment.id)}
                      >
                        &#10003;
                      </button>
                      <button
                        style={{
                          border: "none",
                          background: "transparent",
                          color: "red",
                          marginLeft: "15px",
                        }}
                        title="cancelar (no asistido)"
                        onClick={() => handleCancellation(appointment.id)}
                      >
                        &#10005;
                      </button>
                    </td>
                  )}
              </React.Fragment>
            ))}
        </tr>
      </React.Fragment>
    );
  };

  const handleSearch = (query) => {
    const filteredAppointments = store.myAppointments.filter((appointment) => {
      // Trouver le patient correspondant dans store.patients
      const patient = store.patients.find(
        (p) => p.id === appointment.patient_id
      );

      // Effectuer la recherche sur les données du patient
      return (
        (patient &&
          (patient.firstname.toLowerCase().includes(query.toLowerCase()) ||
            patient.lastname.toLowerCase().includes(query.toLowerCase()))) ||
        patient.dni.toString().includes(query)
      );
    });

    setSearchError(filteredAppointments.length === 0);
    setFilteredAppointments(filteredAppointments);
  };

  return (
    <>
      {store.employee &&
      store.employee.specialist &&
      (store.employee.specialist !== "enfermera" ||
        store.employee.specialist !== "enfermero") ? (
        <div className="admin-appointments-content">
          <h1
            className="text-center font-bold my-4"
            style={{ fontSize: "2.5rem" }}
          >
            Lista de Citas Médicas:
          </h1>
          <SearchBar onSearch={handleSearch} />
          {searchError && (
            <p className="text-center text-danger">
              No se encontraron citas médicas.
            </p>
          )}
          <div
            className="table-responsive"
            style={{ width: "100%", margin: "0 auto" }}
          >
            <SortingTable
              headers={headers}
              data={
                filteredAppointments.length > 0
                  ? filteredAppointments
                  : sortedAppointments
              }
              renderRow={renderRow}
            />
          </div>
        </div>
      ) : (
        <h2>componente denegado</h2>
      )}
    </>
  );
};

export default MyAppointments;
