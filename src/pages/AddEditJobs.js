// material
import {
  Card,
  Stack,
  Container,
  Button,
  Typography,
  TextField,
  Grid,
  MenuItem
} from '@material-ui/core';
import { useState, useEffect } from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useLocation } from 'react-router-dom';
import AdapterDateFns from '@material-ui/lab/AdapterDateFns';
import LocalizationProvider from '@material-ui/lab/LocalizationProvider';
import DateTimePicker from '@material-ui/lab/DateTimePicker';
// components
import useQuery from '../utils/useQuery';
import Page from '../components/Page';
import Scrollbar from '../components/Scrollbar';
import firebase from '../firebase';
import { jobDataGet, clientDataGet, driverDataGet } from '../utils/cache';

const UserSchemaValidations = Yup.object().shape({
  customer: Yup.string().required('Required'),
  bookingDate: Yup.string().required('Required'),
  pickUp: Yup.string().required('Required'),
  dropOff: Yup.string().required('Required'),
  price: Yup.string().required('Required'),
  profit: Yup.string().required('Required'),
  distance: Yup.number().required('Required'),
  hour: Yup.number().required('Required')
});

export default function AddEditJobs() {
  const location = useLocation();
  const queryString = useQuery(location.search);
  const act = queryString.get('act');
  const id = queryString.get('id');
  const [jobs, setJobs] = useState(jobDataGet() || []);
  const [clients, setClients] = useState(clientDataGet() || []);
  const [drivers, setDrivers] = useState(driverDataGet() || []);
  const [variable, setVariable] = useState([]);

  useEffect(() => {
    if (act === 'Edit') {
      firebase
        .firestore()
        .collection('jobs')
        .onSnapshot((snapshot) => {
          const newJob = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
          }));
          setJobs(newJob);
        });
    }
    firebase
      .firestore()
      .collection('clients')
      .onSnapshot((snapshot) => {
        const newClient = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
        setClients(newClient);
      });
    firebase
      .firestore()
      .collection('drivers')
      .onSnapshot((snapshot) => {
        const newDriver = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
        setDrivers(newDriver);
      });
    firebase
      .firestore()
      .collection('variable')
      .onSnapshot((snapshot) => {
        const newVar = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
        setVariable(newVar);
      });
  }, [act]);

  const filteredJobs = jobs.filter((job) => id === job.id);

  const handleSubmit = async (values) => {
    const driverPaid =
      variable[0].emp_rate * values.hour + variable[0].driver_kms_m * values.distance;
    if (values.driver) {
      const driverDetail = await drivers.filter((driver) => driver.id === values.driver)[0];
      firebase.firestore().collection('drivers').doc(values.driver).set({
        name: driverDetail?.name,
        password: driverDetail?.password,
        email: driverDetail?.email,
        phone: driverDetail?.phone,
        licenseNumber: driverDetail?.licenseNumber,
        regoNumber: driverDetail?.regoNumber,
        employeeType: driverDetail?.employeeType,
        onWork: true,
        status: 'active'
      });
    }

    if (act === 'Add') {
      firebase.firestore().collection('jobs').add({
        customer: values.customer,
        driver: values.driver,
        notes: values.notes,
        pickUp: values.pickUp,
        price: values.price,
        profit: values.profit,
        driverPaid,
        bookingDate: values.bookingDate.toString(),
        dropOff: values.dropOff,
        expensePrice: 0,
        expenseReason: 'none',
        hour: values.hour,
        distance: values.distance,
        date: new Date(),
        duplicate: true,
        paid: false,
        jobStat: 0
      });
    } else {
      firebase.firestore().collection('jobs').doc(filteredJobs[0].id).set({
        customer: values?.customer,
        driver: values?.driver,
        notes: values?.notes,
        pickUp: values?.pickUp,
        price: values?.price,
        profit: values?.profit,
        driverPaid,
        bookingDate: values?.bookingDate.toString(),
        dropOff: values?.dropOff,
        expensePrice: 0,
        expenseReason: 'none',
        hour: values?.hour,
        distance: values?.distance,
        date: new Date(),
        duplicate: true,
        paid: false,
        jobStat: 0
      });
    }
  };

  return (
    <Page title="Bookings | Minimal-UI">
      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            {act} Bookings
          </Typography>
        </Stack>
        <Card>
          <Scrollbar>
            <Formik
              initialValues={
                filteredJobs[0] || {
                  customer: '',
                  bookingDate: '',
                  pickUp: '',
                  dropOff: '',
                  price: '',
                  profit: '',
                  driverPaid: '',
                  driver: '',
                  notes: '',
                  distance: 0,
                  hour: 0
                }
              }
              validationSchema={UserSchemaValidations}
              onSubmit={(values, { setSubmitting }) => {
                setTimeout(() => {
                  handleSubmit(values);
                  setSubmitting(false);
                }, 400);
              }}
            >
              {({ values, errors, handleChange, handleSubmit, setFieldValue, isSubmitting }) => (
                <form onSubmit={handleSubmit} style={{ padding: 20, textAlign: 'center' }}>
                  <Grid container justifyContent="space-between" spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        select
                        required
                        error={errors?.customer && true}
                        style={{ marginBottom: 15, textAlign: 'left' }}
                        fullWidth
                        helperText={errors?.customer}
                        onChange={handleChange('customer')}
                        value={values.customer}
                        id="customer"
                        label="Client"
                      >
                        {clients.map((client) => (
                          <MenuItem key={client.id} value={client.id}>
                            {client.name}
                          </MenuItem>
                        ))}
                      </TextField>
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DateTimePicker
                          renderInput={(props) => (
                            <TextField
                              {...props}
                              helperText={errors?.bookingDate}
                              fullWidth
                              style={{ marginBottom: 15 }}
                            />
                          )}
                          id="bookingDate"
                          label="Booking Date & Time"
                          error={errors?.bookingDate && true}
                          onChange={(value) => setFieldValue('bookingDate', value)}
                          value={values?.bookingDate}
                          inputFormat="dd/MM/yyyy hh:mm a"
                          defaultValue="2017-05-24T10:30"
                          InputLabelProps={{
                            shrink: true
                          }}
                        />
                      </LocalizationProvider>
                      <TextField
                        required
                        error={errors?.pickUp && true}
                        style={{ marginBottom: 15 }}
                        fullWidth
                        helperText={errors?.pickUp}
                        onChange={handleChange}
                        value={values.pickUp}
                        id="pickUp"
                        label="Pick Up"
                      />
                      <TextField
                        required
                        error={errors?.dropOff && true}
                        style={{ marginBottom: 15 }}
                        fullWidth
                        helperText={errors?.dropOff}
                        onChange={handleChange}
                        value={values.dropOff}
                        id="dropOff"
                        label="Drop Off"
                      />
                      <TextField
                        required
                        error={errors?.hour && true}
                        style={{ marginBottom: 15 }}
                        fullWidth
                        multiline
                        helperText={errors?.hour}
                        onChange={handleChange}
                        value={values.hour}
                        id="hour"
                        label="Hour"
                        type="number"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        required
                        error={errors?.price && true}
                        style={{ marginBottom: 15 }}
                        fullWidth
                        helperText={errors?.price}
                        onChange={handleChange}
                        value={values.price}
                        id="price"
                        label="Amount"
                      />
                      <TextField
                        required
                        error={errors?.profit && true}
                        style={{ marginBottom: 15 }}
                        fullWidth
                        helperText={errors?.profit}
                        onChange={handleChange}
                        value={values.profit}
                        id="profit"
                        label="Profit"
                      />
                      <TextField
                        select
                        style={{ marginBottom: 15, textAlign: 'left' }}
                        fullWidth
                        onChange={handleChange('driver')}
                        value={values.driver}
                        id="driver"
                        label="Driver"
                      >
                        {drivers.map((driver) => (
                          <MenuItem key={driver.id} value={driver.id}>
                            {driver.name}
                          </MenuItem>
                        ))}
                      </TextField>
                      <TextField
                        required
                        error={errors?.distance && true}
                        style={{ marginBottom: 15 }}
                        fullWidth
                        multiline
                        helperText={errors?.distance}
                        onChange={handleChange}
                        value={values.distance}
                        id="distance"
                        label="Distance"
                        type="number"
                      />
                      <TextField
                        style={{ marginBottom: 15 }}
                        fullWidth
                        multiline
                        onChange={handleChange}
                        value={values.notes}
                        rows={4}
                        id="notes"
                        label="notes"
                      />
                    </Grid>
                  </Grid>
                  <Button type="submit" disabled={isSubmitting}>
                    {act === 'Add' ? 'Submit' : 'Save Changes'}
                  </Button>
                </form>
              )}
            </Formik>
          </Scrollbar>
        </Card>
      </Container>
    </Page>
  );
}
