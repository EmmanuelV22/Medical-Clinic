/* eslint-disable no-unused-vars */
import React, { useContext, useEffect, useState } from "react";
import { Context } from "../../store/appContext";

const CreateHistoric = ({ id }) => {
  const { store, actions } = useContext(Context);
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [agenda_id, setAgendaId] = useState(null);
  const [treatment_id, setTreatment_id] = useState(null);
  const medical_id = store.employee.id;

  const getPatientId = async () => {
    if (id !== null) {
      await actions.getPatientById(id);
    }
  };
  useEffect(() => {
    if (id) {
      getPatientId();
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await actions
      .createHistoric(
        id,
        medical_id,
        agenda_id,
        treatment_id,
        description,
        date
      )
      .catch((err) => {
        console.log(err);
      });
    console.log(id);
    setDate("");
    setDescription("");
    window.location.reload();
  };
  return (

    <>
      {store.employee && store.employee.specialist !== "admin" ? (
        <div>
          <form onSubmit={handleSubmit}>
            <label htmlFor="description">Descripción</label>{" "}
            <input
              type="text"
              value={description}
              id="description"
              onChange={(e) => setDescription(e.target.value)}
            />
            <label htmlFor="date">Fecha</label>{" "}
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <button>crear historia</button>
          </form>
        </div>
      ) : (
        <h1>denegado</h1>
      )}
    </>

  );
};

export default CreateHistoric;
