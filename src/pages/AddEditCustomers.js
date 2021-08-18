// material
import {
  Card,
  Stack,
  Container,
  Button,
  Switch,
  Typography,
  TextField,
  Snackbar,
  Alert,
  Grid
} from '@material-ui/core';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useLocation } from 'react-router-dom';
// components
import useQuery from '../utils/useQuery';
import Page from '../components/Page';
import Scrollbar from '../components/Scrollbar';
import firebase from '../firebase';
import { customerDataGet } from '../utils/cache';
import MapContainer from '../components/maps/MapContainer';

const CustomerSchemaValidations = Yup.object().shape({
  name: Yup.string().required('Required'),
  email: Yup.string().email('Invalid email').required('Required'),
  idNumber: Yup.string().required('Required'),
  address: Yup.string().required('Required'),
  password: Yup.string().required('Required'),
  vechile: Yup.string().required('Required'),
  vechile_number: Yup.string().required('Required')
});

export default function AddEditCustomers() {
  const URL = 'https://modacar-antares.herokuapp.com/antares-data';
  const location = useLocation();
  const queryString = useQuery(location.search);
  const act = queryString.get('act');
  const id = queryString.get('id');
  const [customers, setCustomers] = useState(customerDataGet() || []);
  const [antaresData, setAntaresData] = useState();
  const [activeVechile, setActiveVechile] = useState(true);
  const [alertState, setAlertState] = useState(false);

  const switchVechileStatus = () => {
    setActiveVechile(!activeVechile);
    setAlertState(true);
  };

  const closeAlert = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setAlertState(false);
  };

  useEffect(() => {
    if (act === 'Edit') {
      axios
        .get(URL)
        .then((response) => {
          const responseData = JSON.parse(response.data.values['m2m:cin'].con);
          setAntaresData(responseData);
        })
        .catch((error) => {
          console.log(`error ${error}`);
        });
      firebase
        .firestore()
        .collection('customers')
        .onSnapshot((snapshot) => {
          const newCustomers = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
          }));
          setCustomers(newCustomers);
        });
    }
  }, [act]);

  const filteredCustomer = customers.filter((customer) => id === customer.idNumber);

  const handleSubmit = (values) => {
    if (act === 'Add') {
      firebase
        .firestore()
        .collection('customers')
        .add({
          email: values.email,
          idNumber: values.idNumber,
          address: values.address,
          name: values.name,
          password: values.password,
          status: values.status,
          vechile: parseInt(values.vechile, 10),
          vechile_number: values.vechile_number
        });
    } else {
      firebase
        .firestore()
        .collection('customers')
        .doc(filteredCustomer[0].id)
        .set({
          email: values?.email,
          idNumber: values?.idNumber,
          address: values?.address,
          name: values?.name,
          password: values?.password,
          status: values?.status,
          vechile: parseInt(values?.vechile, 10),
          vechile_number: values?.vechile_number
        });
    }
  };

  return (
    <Page title="Customers | Minimal-UI">
      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            {act} Customers
          </Typography>
        </Stack>
        {act === 'Edit' && (
          <>
            <Card style={{ marginBottom: 20 }}>
              <MapContainer location={antaresData} />
            </Card>
            <Card style={{ marginBottom: 20, padding: 20 }}>
              <Typography variant="h6">
                {activeVechile ? 'Set Non-active vechile' : 'Set Active vechile'}
              </Typography>
              <Switch checked={activeVechile} onChange={switchVechileStatus} name="checkedA" />
            </Card>
          </>
        )}
        <Card>
          <Scrollbar>
            <Formik
              initialValues={
                filteredCustomer[0] || {
                  email: '',
                  idNumber: '',
                  address: '',
                  name: '',
                  password: '',
                  status: '',
                  vechile: 1,
                  vechile_number: ''
                }
              }
              validationSchema={CustomerSchemaValidations}
              onSubmit={(values, { setSubmitting }) => {
                setTimeout(() => {
                  handleSubmit(values);
                  setSubmitting(false);
                }, 400);
              }}
            >
              {({ values, errors, handleChange, handleSubmit, isSubmitting }) => (
                <form onSubmit={handleSubmit} style={{ padding: 20, textAlign: 'center' }}>
                  <Grid container justifyContent="space-between" spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        error={errors?.email && true}
                        required
                        style={{ marginBottom: 15 }}
                        fullWidth
                        helperText={errors?.email}
                        onChange={handleChange}
                        value={values.email}
                        id="email"
                        label="Email"
                      />
                      <TextField
                        required
                        error={errors?.idNumber && true}
                        style={{ marginBottom: 15 }}
                        fullWidth
                        helperText={errors?.idNumber}
                        onChange={handleChange}
                        value={values.idNumber}
                        id="idNumber"
                        label="ID Number"
                      />
                      <TextField
                        required
                        error={errors?.name && true}
                        style={{ marginBottom: 15 }}
                        fullWidth
                        helperText={errors?.name}
                        onChange={handleChange}
                        value={values.name}
                        id="name"
                        label="Name"
                      />
                      <TextField
                        required
                        error={errors?.address && true}
                        style={{ marginBottom: 15 }}
                        fullWidth
                        helperText={errors?.address}
                        onChange={handleChange}
                        multiline
                        maxRows={3}
                        value={values.address}
                        id="address"
                        label="Address"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        required
                        error={errors?.password && true}
                        style={{ marginBottom: 15 }}
                        fullWidth
                        helperText={errors?.password}
                        onChange={handleChange}
                        value={values.password}
                        type="password"
                        id="password"
                        label="Password"
                      />
                      <TextField
                        style={{ marginBottom: 15 }}
                        fullWidth
                        onChange={handleChange}
                        value={values.status}
                        id="status"
                        label="Status"
                      />
                      <TextField
                        required
                        error={errors?.vechile && true}
                        style={{ marginBottom: 15 }}
                        fullWidth
                        helperText={errors?.vechile}
                        onChange={handleChange}
                        value={values.vechile}
                        type="nummber"
                        id="vechile"
                        label="Vechile"
                      />
                      <TextField
                        required
                        error={errors?.vechile_number && true}
                        style={{ marginBottom: 15 }}
                        fullWidth
                        helperText={errors?.vechile_number}
                        onChange={handleChange}
                        value={values.vechile_number}
                        id="vechile_number"
                        label="Vechile Number"
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
        <Snackbar open={alertState} autoHideDuration={6000} onClose={closeAlert}>
          <Alert onClose={closeAlert} severity="success">
            {!activeVechile ? 'Already Non-active' : 'Vechile actived'}
          </Alert>
        </Snackbar>
      </Container>
    </Page>
  );
}
