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
// components
import useQuery from '../utils/useQuery';
import Page from '../components/Page';
import Scrollbar from '../components/Scrollbar';
import firebase from '../firebase';
import { driverDataGet } from '../utils/cache';

const UserSchemaValidations = Yup.object().shape({
  name: Yup.string().required('Required'),
  password: Yup.string().required('Required'),
  email: Yup.string().email('Invalid email').required('Required'),
  phone: Yup.number().required('Required'),
  licenseNumber: Yup.number().required('Required'),
  regoNumber: Yup.number().required('Required'),
  employeeType: Yup.number().required('Required')
});

export default function AddEditDrivers() {
  const location = useLocation();
  const queryString = useQuery(location.search);
  const act = queryString.get('act');
  const id = queryString.get('id');
  const [drivers, setDrivers] = useState(driverDataGet() || []);

  useEffect(() => {
    if (act === 'Edit') {
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
    }
  }, [act]);

  const filteredDrivers = drivers.filter((user) => id === user.id);

  const handleSubmit = (values) => {
    if (act === 'Add') {
      firebase.firestore().collection('drivers').add({
        name: values.name,
        password: values.password,
        email: values.email,
        phone: values.phone,
        licenseNumber: values.licenseNumber,
        regoNumber: values.regoNumber,
        employeeType: values.employeeType,
        onWork: false,
        status: 'active'
      });
    } else {
      firebase.firestore().collection('drivers').doc(filteredDrivers[0].id).set({
        name: values?.name,
        password: values?.password,
        email: values?.email,
        phone: values?.phone,
        licenseNumber: values?.licenseNumber,
        regoNumber: values?.regoNumber,
        employeeType: values?.employeeType,
        onWork: false,
        status: 'active'
      });
    }
  };

  return (
    <Page title="Driver | Minimal-UI">
      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            {act} Driver
          </Typography>
        </Stack>
        <Card>
          <Scrollbar>
            <Formik
              initialValues={
                filteredDrivers[0] || {
                  name: '',
                  password: '',
                  email: '',
                  phone: 0,
                  licenseNumber: 0,
                  regoNumber: 0,
                  employeeType: 0
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
              {({ values, errors, handleChange, handleSubmit, isSubmitting }) => (
                <form onSubmit={handleSubmit} style={{ padding: 20, textAlign: 'center' }}>
                  <Grid container justifyContent="space-between" spacing={2}>
                    <Grid item xs={6}>
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
                        multiline
                        maxRows={3}
                        error={errors?.phone && true}
                        helperText={errors?.phone}
                        value={values.phone}
                        type="number"
                        id="phone"
                        label="Contact Number"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        style={{ marginBottom: 15 }}
                        fullWidth
                        onChange={handleChange}
                        multiline
                        maxRows={3}
                        value={values.licenseNumber}
                        error={errors?.licenseNumber && true}
                        helperText={errors?.licenseNumber}
                        type="number"
                        id="licenseNumber"
                        label="License Number"
                      />
                      <TextField
                        style={{ marginBottom: 15 }}
                        fullWidth
                        onChange={handleChange}
                        multiline
                        maxRows={3}
                        value={values.regoNumber}
                        error={errors?.regoNumber && true}
                        helperText={errors?.regoNumber}
                        type="number"
                        id="regoNumber"
                        label="Rego Number"
                      />
                      <TextField
                        select
                        required
                        error={errors?.employeeType && true}
                        style={{ marginBottom: 15, textAlign: 'left' }}
                        fullWidth
                        helperText={errors?.employeeType}
                        onChange={handleChange('employeeType')}
                        value={values.employeeType}
                        id="employeeType"
                        label="Employee Type"
                      >
                        <MenuItem key="0" value={0}>
                          Part Time
                        </MenuItem>
                        <MenuItem key="1" value={1}>
                          Permanent
                        </MenuItem>
                      </TextField>
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
