/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useEffect } from "react";
import { Context } from "../../store/appContext";
import { useParams } from "react-router";
import DoctorInfo from "../../components/DoctorInfo ";

const TreatmentById = () => {
  const { store, actions } = useContext(Context);
  const { treatment_id } = useParams();

  const getTreatmentByNotif = async () => {
    await actions.getTreatmentById(treatment_id);
    console.log(store.treatment);
  };

  const getDoctorData = async (id) => {
    const doctorData = await actions.getEmployeeById(id);
    return doctorData;
  };

  const getPatientData = async (id) => {
    const patientData = await actions.getPatientById(id);
    return patientData;
  };

  useEffect(() => {
    getTreatmentByNotif();
    getPatientData(store.treatment.patient_id);
  }, [store.treatment.patient_id]);

  return (
    <div>
      <h1>Detalles del tratamiento:</h1>
      <h2>Paciente:</h2>
      <p>
        {store.patientData.patientData?.firstname +
          "  " +
          store.patientData.patientData?.lastname}
      </p>
      <h2>DNI:</h2>
      <p>{store.patientData.patientData?.dni}</p>
      <h2>Resumen:</h2>
      <p>{store.treatment.resume}</p>
      <h2>Medicina:</h2>
      <td>
        {store.treatment.medicine_data &&
          JSON.parse(store.treatment.medicine_data).map(
            (medicine, medIndex) => (
              <div key={medIndex}>
                <div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="16"
                    width="16"
                    viewBox="0 0 512 512"
                  >
                    <path d="M441 7l32 32 32 32c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-15-15L417.9 128l55 55c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-72-72L295 73c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l55 55L422.1 56 407 41c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0zM210.3 155.7l61.1-61.1c.3 .3 .6 .7 1 1l16 16 56 56 56 56 16 16c.3 .3 .6 .6 1 1l-191 191c-10.5 10.5-24.7 16.4-39.6 16.4H97.9L41 505c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l57-57V325.3c0-14.9 5.9-29.1 16.4-39.6l43.3-43.3 57 57c6.2 6.2 16.4 6.2 22.6 0s6.2-16.4 0-22.6l-57-57 41.4-41.4 57 57c6.2 6.2 16.4 6.2 22.6 0s6.2-16.4 0-22.6l-57-57z" />
                  </svg>
                  {medicine.medicine_name}
                </div>
                <div>Quantity: {medicine.quantity}</div>
              </div>
            )
          )}
      </td>
      <h2>Fecha de inicio:</h2>
      <p>
        {store.treatment.initial_date &&
          actions.dateFormater(store.treatment.initial_date)}
      </p>
      <h2>Fecha de finalizacion:</h2>
      <p>
        {store.treatment.exp_date
          ? actions.dateFormater(store.treatment.exp_date)
          : "NO"}
      </p>
      <h2>Patologias:</h2>
      <p>{store.treatment.patologies}</p>
      <h2>Es Cirugia:</h2>
      <p>{store.treatment.surgey}</p>
      <h2>Doctor:</h2>
      <DoctorInfo
        medicalId={store.treatment.medical_id}
        getDoctorData={getDoctorData}
      />
      <h2>Terminado:</h2>
      <p>{store.treatment.finish_treatment ? "SI" : "NO"}</p>
      <h2>Actualizado:</h2>
      <p>
        {store.treatment.updatedAt
          ? actions.dateFormater(store.treatment.updatedAt)
          : "NO"}
      </p>
    </div>
  );
};

export default TreatmentById;
