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
import { useLocation, useNavigate } from 'react-router-dom';
import AdapterDateFns from '@material-ui/lab/AdapterDateFns';
import LocalizationProvider from '@material-ui/lab/LocalizationProvider';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import { DatePicker } from '@material-ui/lab';
import moment from 'moment';
import TimePicker from 'rc-time-picker';
// components
import useQuery from '../utils/useQuery';
import Page from '../components/Page';
import Scrollbar from '../components/Scrollbar';
import firebase from '../firebase';
import {
  jobDataGet,
  clientDataGet,
  authDataGet,
  driverDataGet,
  itemRateDataGet
} from '../utils/cache';
import 'rc-time-picker/assets/index.css';
import '../utils/timepicker.css';

const format = 'hh:mm a';
const now = moment().hour(0).minute(0);

const UserSchemaValidations = Yup.object().shape({
  customer: Yup.string().required('Required'),
  bookingDate: Yup.string().required('Required'),
  pickUp: Yup.string().required('Required'),
  dropOff: Yup.string().required('Required'),
  distance: Yup.number().required('Required'),
  hour: Yup.number().required('Required')
});

export default function AddEditJobs() {
  const navigate = useNavigate();
  const location = useLocation();
  const [users, setUsers] = useState([]);
  const [auth, setAuth] = useState();
  const queryString = useQuery(location.search);
  const act = queryString.get('act');
  const id = queryString.get('id');
  const [itemRate, setItemRate] = useState(itemRateDataGet() || []);
  const [jobs, setJobs] = useState(jobDataGet() || []);
  const [clients, setClients] = useState(clientDataGet() || []);
  const [drivers, setDrivers] = useState(driverDataGet() || []);
  const [variable, setVariable] = useState([]);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  //
  const [jobStatusAlignment, setJobStatusAlignment] = useState(false);

  useEffect(() => {
    setAuth(authDataGet());
    firebase
      .firestore()
      .collection('users')
      .onSnapshot((snapshot) => {
        const newUser = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
        setUsers(newUser);
      });
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
      .collection('itemrate')
      .onSnapshot((snapshot) => {
        const newItemRate = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
        setItemRate(newItemRate);
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
    const driverPaid = variable[0].empRate * values.hour + variable[0].driverKms * values.distance;
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
      firebase
        .firestore()
        .collection('jobs')
        .add({
          customer: values.customer,
          driver: values.driver,
          incentive: values?.incentive,
          notes: values.notes,
          pickUp: values.pickUp,
          price: values.price,
          profit: values.profit,
          bookingTime: values.bookingTime.toString(),
          driverPaid,
          bookingDate: values.bookingDate.toString(),
          dropOff: values.dropOff,
          expensePrice: 0,
          expenseReason: 'none',
          hour: values.hour,
          item: values.item,
          distance: values.distance,
          date: new Date(),
          duplicate: true,
          paid: false,
          jobStat: values.driver === '' ? 7 : 0
        });
    } else {
      firebase
        .firestore()
        .collection('jobs')
        .doc(filteredJobs[0].id)
        .set({
          customer: values?.customer,
          driver: values?.driver,
          incentive: values?.incentive,
          notes: values?.notes,
          pickUp: values?.pickUp,
          price: values?.price,
          profit: values?.profit,
          bookingTime: values?.bookingTime.toString(),
          driverPaid,
          bookingDate: values?.bookingDate.toString(),
          dropOff: values?.dropOff,
          expensePrice: 0,
          expenseReason: 'none',
          hour: values?.hour,
          item: values?.item,
          distance: values?.distance,
          date: new Date(),
          duplicate: true,
          paid: false,
          jobStat: jobStatusAlignment ? 0 : values?.jobStat || 0
        });
    }
  };

  const setRequested = (values) => {
    if (values.jobStat) {
      setJobStatusAlignment(true);
    }
  };

  const filteredUser = users.filter((user) => user.email === auth.user.email)[0];

  return (
    <Page title="Bookings | Minimal-UI">
      <Container maxWidth={false}>
        <Snackbar open={openSnackbar} autoHideDuration={300}>
          <MuiAlert elevation={6} variant="filled" severity="success" sx={{ width: '100%' }}>
            Saved
          </MuiAlert>
        </Snackbar>
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
                  bookingTime: now,
                  pickUp: '',
                  dropOff: '',
                  price: '',
                  profit: '',
                  driverPaid: '',
                  driver: '',
                  notes: '',
                  item: '',
                  distance: 0,
                  hour: 1
                }
              }
              validationSchema={UserSchemaValidations}
              onSubmit={(values, { setSubmitting }) => {
                setOpenSnackbar(true);
                navigate(-1);
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
                        onBlur={() => {
                          const address = clients.filter((client) => client.id === values.customer);
                          setFieldValue('pickUp', address[0].address);
                        }}
                        value={values.customer}
                        id="customer"
                        label="Client"
                      >
                        {clients
                          .filter((client) => client.status === 'active')
                          .map((clientmap) => (
                            <MenuItem key={clientmap.id} value={clientmap.id}>
                              {clientmap.name}
                            </MenuItem>
                          ))}
                      </TextField>
                      <Grid container spacing={2}>
                        <Grid item>
                          <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
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
                              inputFormat="dd/MM/yyyy"
                              defaultValue="2017-05-24T10:30"
                              InputLabelProps={{
                                shrink: true
                              }}
                            />
                          </LocalizationProvider>
                        </Grid>
                        <Grid item>
                          <TimePicker
                            showSecond={false}
                            defaultValue={now}
                            value={moment(values.bookingTime)}
                            onChange={(value) => setFieldValue('bookingTime', value)}
                            format={format}
                            use12Hours
                            inputReadOnly
                          />
                        </Grid>
                      </Grid>
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
                      {filteredUser?.role === 'superadmin' && (
                        <TextField
                          error={errors?.hour && true}
                          style={{ marginBottom: 15 }}
                          fullWidth
                          multiline
                          helperText={errors?.hour}
                          onChange={handleChange}
                          value={values.hour}
                          onBlur={() => {
                            const itemRates =
                              itemRate.filter((items) => items.id === values.item) || 0;
                            setFieldValue('price', itemRates[0]?.rate * values.hour);
                            setFieldValue(
                              'profit',
                              itemRates[0]?.rate * values.hour -
                                (variable[0]?.empRate * values.hour +
                                  variable[0]?.driverKms * values.distance)
                            );
                          }}
                          id="hour"
                          label="Hour"
                          type="number"
                        />
                      )}
                      <TextField
                        select
                        style={{ marginBottom: 15, textAlign: 'left' }}
                        fullWidth
                        onChange={handleChange('item')}
                        onBlur={() => {
                          const itemRates = itemRate.filter((items) => items.id === values.item);
                          setFieldValue('price', itemRates[0].rate * values.hour);
                          setFieldValue(
                            'profit',
                            itemRates[0].rate * values.hour -
                              (variable[0]?.empRate * values.hour +
                                variable[0]?.driverKms * values.distance)
                          );
                        }}
                        value={values.item}
                        id="item"
                        label="Item Rate"
                      >
                        {itemRate.map((item) => (
                          <MenuItem key={item.id} value={item.id}>
                            {item.name}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid item xs={6}>
                      {filteredUser?.role === 'superadmin' && (
                        <>
                          <TextField
                            style={{ marginBottom: 15 }}
                            fullWidth
                            onChange={handleChange}
                            disabled
                            value={values.price || 0}
                            id="price"
                            label="Charges"
                          />
                          <TextField
                            style={{ marginBottom: 15 }}
                            fullWidth
                            disabled
                            onChange={handleChange}
                            value={values.profit || 0}
                            id="profit"
                            label="Profit"
                          />
                        </>
                      )}
                      <TextField
                        select
                        style={{ marginBottom: 15, textAlign: 'left' }}
                        fullWidth
                        onChange={handleChange('driver')}
                        onBlur={() => setRequested(values)}
                        value={values.driver}
                        id="driver"
                        label="Driver"
                      >
                        {drivers
                          .filter((driver) => driver.status === 'active')
                          .map((drivermap) => (
                            <MenuItem key={drivermap.id} value={drivermap.id}>
                              {drivermap.name}
                            </MenuItem>
                          ))}
                      </TextField>
                      <TextField
                        select
                        style={{ marginBottom: 15, textAlign: 'left' }}
                        fullWidth
                        onChange={handleChange('incentive')}
                        onBlur={() => setRequested(values)}
                        value={values.incentive}
                        id="incentive"
                        label="Driver's Rate"
                      >
                        <MenuItem value={30}>30</MenuItem>
                        <MenuItem value={35}>35</MenuItem>
                        <MenuItem value={45}>45</MenuItem>
                      </TextField>
                      {filteredUser?.role === 'superadmin' && (
                        <TextField
                          required
                          error={errors?.distance && true}
                          style={{ marginBottom: 15 }}
                          fullWidth
                          multiline
                          helperText={errors?.distance}
                          onChange={handleChange}
                          onBlur={() => {
                            const itemRates =
                              itemRate.filter((items) => items.id === values.item) || 0;
                            setFieldValue('price', itemRates[0]?.rate * values.hour);
                            setFieldValue(
                              'profit',
                              itemRates[0]?.rate * values.hour -
                                (variable[0]?.empRate * values.hour +
                                  variable[0]?.driverKms * values.distance)
                            );
                          }}
                          value={values.distance}
                          id="distance"
                          label="Distance"
                          type="number"
                        />
                      )}
                      <TextField
                        style={{ marginBottom: 15 }}
                        fullWidth
                        multiline
                        onChange={handleChange}
                        value={values.notes}
                        rows={4}
                        id="notes"
                        label="Instructions"
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
