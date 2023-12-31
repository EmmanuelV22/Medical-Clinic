/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useContext, useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import es from "date-fns/locale/es";
import { Context } from "../store/appContext";
import "react-datepicker/dist/react-datepicker.css";
import "react-datepicker/dist/react-datepicker-cssmodules.css";
// import '../styles/datepicker.scss';
const AppointmentScheduler = ({ doctorId, daysOff, startTime, endTime }) => {
  const { actions, store } = useContext(Context);
  const [selectedDate, setSelectedDate] = useState(null);
  const [available, setAvailable] = useState(1);
  const [arrayDeExcludes, setArrayDeExcludes] = useState([]);
  const [arrayDeExcludesForSelected, setArrayDeExcludesForSelected] = useState([]);
  const disabledDates = [];
  function agregarFechaDeshabilitada(dia, mes, año) {
    disabledDates.push(new Date(año, mes - 1, dia));
  }
  function deshabilitarFechaEnRango(fechaInicio, fechaFin) {
    let currentDate = new Date(fechaInicio);
    while (currentDate <= fechaFin) {
      if (currentDate.getDay() === daysOff) {
        agregarFechaDeshabilitada(
          currentDate.getDate(),
          currentDate.getMonth() + 1,
          currentDate.getFullYear()
        );
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }
  const fechaInicio = new Date(2023, 0, 1); // 1 de enero de 2023
  const fechaFin = new Date(2025, 11, 31); // 31 de diciembre de 2050
  // Deshabilitar todos los dias de descanso en el rango especificado
  deshabilitarFechaEnRango(fechaInicio, fechaFin);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    
    const newExcludes = []
    arrayDeExcludes.forEach(e => {
      if(date.getDate() == e.getDate() && date.getMonth() === e.getMonth() && date.getFullYear() == e.getFullYear() ){
        newExcludes.push(e)


    }})
    setArrayDeExcludesForSelected(newExcludes)
    console.log(newExcludes)
    }
    
  
  

  useEffect(() => {
    const fetchAppointments = async () => {
      const arrAppointments = await actions.loadMedicalAppointments(doctorId);
      if (arrAppointments) {
        const updatedExcludes = arrAppointments.agenda.map((e) => {
          const [hora, minutos] = e.time.split(":").map(Number);
          return new Date(e.year, e.month -1, e.date, hora, minutos);
        });
        // Actualizar el estado con las nuevas fechas ocupadas
        setArrayDeExcludes(updatedExcludes);
        
      }
    };

    fetchAppointments();
  }, [doctorId]);

  const handleScheduleAppointment = async () => {
    if (selectedDate) {
      const date = selectedDate.getDate();
      const month = selectedDate.getMonth() +1;
      const year = selectedDate.getFullYear();
      const day = selectedDate.getDay();
      const time = selectedDate.toLocaleTimeString().substring(0, 5);
      const state = "confirmado";
      const patient_id = store.patient.id;
      const medical_id = doctorId;
      console.log(patient_id);
      await actions
        .postAppointment(
          date,
          month,
          year,
          day,
          time,
          state,
          patient_id,
          medical_id,
          available
        )
        .then(window.location.reload())

        .catch((error) => {
          console.error("Error al planificar el turno", error.message);
        });
    } else {
      console.warn("Seleccione una fecha y hora para planificar el turno.");
    }
  };
  return (
    <div>
      <h1>Planificador de turnos</h1>
      <div>
        <label>Seleccione una fecha y hora:</label>
        <DatePicker
          inline
          locale={es}
          calendarStartDay={0}
          selected={selectedDate}
          onChange={handleDateChange}
          minDate={new Date()}
          maxDate={new Date(new Date().getTime() + 60 * 24 * 60 * 60 * 1000)}
          timeIntervals={15}
          timeCaption="horarios"
          showTimeSelect
          dateFormat="Pp"
          minTime={new Date().setHours(startTime, 0, 0, 0)}
          maxTime={new Date().setHours(endTime, 0, 0, 0)}
          excludeTimes={arrayDeExcludesForSelected}
          excludeDates={disabledDates}
        />
      </div>
      <button onClick={handleScheduleAppointment}>Planificar turno</button>
    </div>
  );
};
export default AppointmentScheduler;
