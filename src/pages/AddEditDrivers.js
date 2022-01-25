// material
import {
  Card,
  Stack,
  Container,
  Button,
  Typography,
  TextField,
  Grid,
  MenuItem,
  InputAdornment,
  OutlinedInput,
  FormControl,
  IconButton,
  InputLabel
} from '@material-ui/core';
import { useState, useEffect } from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useLocation, useNavigate } from 'react-router-dom';
import AdapterDateFns from '@material-ui/lab/AdapterDateFns';
import LocalizationProvider from '@material-ui/lab/LocalizationProvider';
import DatePicker from '@material-ui/lab/DatePicker';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import { Icon } from '@iconify/react';
import eyeFill from '@iconify/icons-eva/eye-fill';
import eyeOffFill from '@iconify/icons-eva/eye-off-2-fill';
// components
import useQuery from '../utils/useQuery';
import Page from '../components/Page';
import Scrollbar from '../components/Scrollbar';
import firebase from '../firebase';
import { driverDataGet } from '../utils/cache';
import JobDetail from '../layouts/JobDetail';

const UserSchemaValidations = Yup.object().shape({
  name: Yup.string().required('Required'),
  password: Yup.string().required('Required'),
  streetNumber: Yup.string().required('Required'),
  streetAddress: Yup.string().required('Required'),
  postCode: Yup.string().required('Required'),
  suburb: Yup.string().required('Required'),
  state: Yup.string().required('Required'),
  email: Yup.string().email('Invalid email').required('Required'),
  phone: Yup.number().required('Required'),
  licenseNumber: Yup.number().required('Required'),
  regoNumber: Yup.string().required('Required'),
  employeeType: Yup.number().required('Required')
});

export default function AddEditDrivers() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryString = useQuery(location.search);
  const act = queryString.get('act');
  const id = queryString.get('id');
  const [drivers, setDrivers] = useState(driverDataGet() || []);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      firebase.auth().createUserWithEmailAndPassword(values.email, values.password);
      firebase
        .firestore()
        .collection('drivers')
        .add({
          name: values.name,
          password: values.password,
          email: values.email,
          streetNumber: values.streetNumber,
          streetAddress: values.streetAddress,
          suburb: values.suburb,
          state: values.state,
          postCode: values.postCode,
          phone: values.phone,
          licenseNumber: values.licenseNumber,
          regoNumber: values.regoNumber,
          dobNumber: values?.dobNumber.toString(),
          address: `${values.streetNumber} ${values.streetAddress} ${values.suburb} ${values.state} ${values.postCode}`,
          employeeType: values.employeeType,
          onWork: false,
          status: 'active'
        });
    } else {
      firebase
        .firestore()
        .collection('drivers')
        .doc(filteredDrivers[0].id)
        .set({
          name: values?.name,
          password: values?.password,
          streetNumber: values?.streetNumber,
          streetAddress: values?.streetAddress,
          suburb: values?.suburb,
          state: values?.state,
          postCode: values.postCode,
          email: values?.email,
          phone: values?.phone,
          licenseNumber: values?.licenseNumber,
          regoNumber: values?.regoNumber,
          address: `${values?.streetNumber} ${values?.streetAddress} ${values?.suburb} ${values?.state} ${values?.postCode}`,
          dobNumber: values?.dobNumber.toString(),
          employeeType: values?.employeeType,
          onWork: false,
          status: 'active'
        });
    }
  };

  return (
    <Page title="Driver | Minimal-UI">
      <Container maxWidth={false}>
        <Snackbar open={openSnackbar} autoHideDuration={300}>
          <MuiAlert elevation={6} variant="filled" severity="success" sx={{ width: '100%' }}>
            Success submit data.
          </MuiAlert>
        </Snackbar>
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
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <TextField
                            error={errors?.streetNumber && true}
                            required
                            style={{ marginBottom: 15 }}
                            fullWidth
                            helperText={errors?.streetNumber}
                            onChange={handleChange}
                            value={values.streetNumber}
                            id="streetNumber"
                            label="Street Number"
                          />
                          <TextField
                            error={errors?.suburb && true}
                            required
                            style={{ marginBottom: 15 }}
                            fullWidth
                            helperText={errors?.suburb}
                            onChange={handleChange}
                            value={values.suburb}
                            id="suburb"
                            label="Suburb"
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            error={errors?.state && true}
                            required
                            style={{ marginBottom: 15 }}
                            fullWidth
                            helperText={errors?.state}
                            onChange={handleChange}
                            value={values.state}
                            id="state"
                            label="State"
                          />
                          <TextField
                            error={errors?.postCode && true}
                            required
                            style={{ marginBottom: 15 }}
                            fullWidth
                            helperText={errors?.postCode}
                            onChange={handleChange}
                            value={values.postCode}
                            id="postCode"
                            label="Post Code"
                          />
                        </Grid>
                      </Grid>
                      <TextField
                        error={errors?.streetAddress && true}
                        required
                        style={{ marginBottom: 15 }}
                        fullWidth
                        helperText={errors?.streetAddress}
                        onChange={handleChange}
                        value={values.streetAddress}
                        id="streetAddress"
                        label="Street Address"
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
                    </Grid>
                    <Grid item xs={6}>
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                          disableFuture
                          renderInput={(props) => (
                            <TextField
                              {...props}
                              helperText={errors?.dobNumber}
                              fullWidth
                              style={{ marginBottom: 15 }}
                            />
                          )}
                          id="dobNumber"
                          label="Date Of Birth"
                          error={errors?.dobNumber && true}
                          onChange={(value) => setFieldValue('dobNumber', value)}
                          value={values?.dobNumber}
                          inputFormat="dd/MM/yyyy"
                          defaultValue="2017-05-24"
                          InputLabelProps={{
                            shrink: true
                          }}
                        />
                      </LocalizationProvider>
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
                        type="text"
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
                        <MenuItem key="2" value={1}>
                          Terminated
                        </MenuItem>
                      </TextField>
                      <FormControl variant="outlined" fullWidth>
                        <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
                        <OutlinedInput
                          required
                          error={errors?.password && true}
                          style={{ marginBottom: 15 }}
                          helperText={errors?.password}
                          onChange={handleChange}
                          value={values.password}
                          type={showPassword ? 'text' : 'password'}
                          id="password"
                          label="Password"
                          endAdornment={
                            <InputAdornment position="end">
                              <IconButton
                                aria-label="toggle password visibility"
                                onClick={() => setShowPassword(!showPassword)}
                                edge="end"
                              >
                                {showPassword ? (
                                  <Icon icon={eyeOffFill} />
                                ) : (
                                  <Icon icon={eyeFill} />
                                )}
                              </IconButton>
                            </InputAdornment>
                          }
                        />
                      </FormControl>
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
      {act === 'Edit' && <JobDetail idParams={id} />}
    </Page>
  );
}
