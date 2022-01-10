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
  Box
} from '@material-ui/core';
import AdapterDateFns from '@material-ui/lab/AdapterDateFns';
import LocalizationProvider from '@material-ui/lab/LocalizationProvider';
import DatePicker from '@material-ui/lab/DatePicker';
import DateRangePicker from '@material-ui/lab/DateRangePicker';
import React, { useState, useEffect } from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useLocation, useNavigate } from 'react-router-dom';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
// components
import useQuery from '../utils/useQuery';
import Page from '../components/Page';
import Scrollbar from '../components/Scrollbar';
import firebase from '../firebase';
import { clientDataGet } from '../utils/cache';
import JobDetail from '../layouts/JobDetail';

const UserSchemaValidations = Yup.object().shape({
  name: Yup.string().required('Required'),
  email: Yup.string().email('Invalid email').required('Required'),
  phone: Yup.number().required('Required'),
  ndisNumber: Yup.number().required('Required'),
  dobNumber: Yup.string().required('Required'),
  planManagementDetail: Yup.number().required('Required')
});

export default function AddEditClients() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryString = useQuery(location.search);
  const act = queryString.get('act');
  const id = queryString.get('id');
  const [clients, setClients] = useState(clientDataGet() || []);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  useEffect(() => {
    if (act === 'Edit') {
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
    }
  }, [act]);

  const filteredClients = clients.filter((client) => id === client.id);

  const handleSubmit = (values) => {
    if (act === 'Add') {
      firebase
        .firestore()
        .collection('clients')
        .add({
          name: values.name,
          email: values.email,
          streetNumber: values?.streetNumber,
          streetAddress: values?.streetAddress,
          suburb: values?.suburb,
          state: values?.state,
          postCode: values.postCode,
          phone: values.phone,
          ndisNumber: values.ndisNumber,
          dobNumber: values?.dobNumber?.toString(),
          address: `${values.streetNumber} ${values.streetAddress} ${values.suburb} ${values.state} ${values.postCode}`,
          clientSpec: values?.clientSpec || '',
          coordinator: values?.coordinator || '',
          planDates: [values?.planDates[0]?.toString(), values?.planDates[1]?.toString()] || [
            '',
            ''
          ],
          fundsQuarantine: values?.fundsQuarantine || 0,
          planManagementDetail: values.planManagementDetail,
          planManager: values?.planManager || '',
          planManagerEmail: values?.planManagerEmail || '',
          status: 'active'
        });
    } else {
      firebase
        .firestore()
        .collection('clients')
        .doc(filteredClients[0].id)
        .set({
          name: values?.name,
          email: values?.email,
          streetNumber: values?.streetNumber,
          streetAddress: values?.streetAddress,
          suburb: values?.suburb,
          state: values?.state,
          postCode: values.postCode,
          phone: values?.phone,
          ndisNumber: values?.ndisNumber,
          dobNumber: values?.dobNumber.toString(),
          planDates: [values?.planDates[0].toString(), values?.planDates[1].toString()],
          address: `${values?.streetNumber} ${values?.streetAddress} ${values?.suburb} ${values?.state} ${values?.postCode}`,
          clientSpec: values?.clientSpec || '',
          coordinator: values?.coordinator || '',
          fundsQuarantine: values?.fundsQuarantine || 0,
          planManagementDetail: values?.planManagementDetail,
          planManager: values?.planManager || '',
          planManagerEmail: values?.planManagerEmail || '',
          status: 'active'
        });
    }
  };

  return (
    <Page title="Client | Minimal-UI">
      <Container maxWidth={false}>
        <Snackbar open={openSnackbar} autoHideDuration={300}>
          <MuiAlert elevation={6} variant="filled" severity="success" sx={{ width: '100%' }}>
            Success submit data.
          </MuiAlert>
        </Snackbar>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            {act} Client
          </Typography>
        </Stack>
        <Card>
          <Scrollbar>
            <Formik
              initialValues={
                filteredClients[0] || {
                  name: '',
                  password: '',
                  email: '',
                  planDates: [null, null],
                  phone: 0,
                  licenseNumber: 0,
                  regoNumber: 0,
                  employeeType: 0,
                  planManager: '',
                  planManagerEmail: ''
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
                        </Grid>
                        <Grid item xs={6}>
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
                      </Grid>
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
                      <TextField
                        style={{ marginBottom: 15 }}
                        fullWidth
                        onChange={handleChange}
                        value={values.clientSpec}
                        id="clientSpec"
                        label="Client Specification"
                      />
                      <TextField
                        style={{ marginBottom: 15 }}
                        fullWidth
                        onChange={handleChange}
                        multiline
                        maxRows={3}
                        value={values.ndisNumber}
                        error={errors?.ndisNumber && true}
                        helperText={errors?.ndisNumber}
                        type="number"
                        id="ndisNumber"
                        label="Ndis Number"
                      />
                      <TextField
                        style={{ marginBottom: 15 }}
                        fullWidth
                        type="number"
                        onChange={handleChange}
                        value={values.fundsQuarantine}
                        id="fundsQuarantine"
                        label="Funds Quarantine"
                      />
                      <TextField
                        select
                        required
                        error={errors?.planManagementDetail && true}
                        style={{ marginBottom: 15, textAlign: 'left' }}
                        fullWidth
                        helperText={errors?.planManagementDetail}
                        onChange={handleChange('planManagementDetail')}
                        value={values.planManagementDetail}
                        id="planManagementDetail"
                        label="Plan Management Type"
                      >
                        <MenuItem key="0" value={0}>
                          Ndis Management
                        </MenuItem>
                        <MenuItem key="1" value={1}>
                          Plan Management
                        </MenuItem>
                      </TextField>
                      {values.planManagementDetail === 1 && (
                        <>
                          <TextField
                            style={{ marginBottom: 15 }}
                            fullWidth
                            type="text"
                            onChange={handleChange}
                            value={values.planManager}
                            id="planManager"
                            label="Plan Manager"
                          />
                          <TextField
                            style={{ marginBottom: 15 }}
                            fullWidth
                            type="text"
                            onChange={handleChange}
                            value={values.planManagerEmail}
                            id="planManagerEmail"
                            label="Plan Manager Email"
                          />
                        </>
                      )}
                      <TextField
                        style={{ marginBottom: 15 }}
                        fullWidth
                        onChange={handleChange}
                        value={values.coordinator}
                        id="coordinator"
                        label="Coordinator"
                      />
                      <div style={{ marginBottom: 15 }}>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                          <DateRangePicker
                            startText="Plan Dates Start"
                            endText="Plan Dates End"
                            value={values.planDates}
                            onChange={(value) => setFieldValue('planDates', value)}
                            id="planDates"
                            inputFormat="dd/MM/yyyy"
                            defaultValue="2017-05-24"
                            renderInput={(startProps, endProps) => (
                              <>
                                <TextField {...startProps} />
                                <Box sx={{ mx: 2 }}> to </Box>
                                <TextField {...endProps} />
                              </>
                            )}
                          />
                        </LocalizationProvider>
                      </div>
                      <TextField
                        style={{ marginBottom: 15 }}
                        fullWidth
                        multiline
                        onChange={handleChange}
                        value={values.notes}
                        rows={4}
                        id="notes"
                        label="Notes"
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
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5} mt={5}>
          <Typography variant="h4" gutterBottom>
            Support Coordinator / Referred By
          </Typography>
        </Stack>
        <Card>
          <Scrollbar>
            <Formik
              initialValues={{
                name: '',
                company: '',
                email: '',
                phone: 0
              }}
              validationSchema={UserSchemaValidations}
              onSubmit={({ setSubmitting }) => {
                setOpenSnackbar(true);
                setTimeout(() => {
                  setSubmitting(false);
                }, 400);
              }}
            >
              {({ values, handleChange, handleSubmit, isSubmitting }) => (
                <form onSubmit={handleSubmit} style={{ padding: 20, textAlign: 'center' }}>
                  <Grid container justifyContent="space-between" spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        style={{ marginBottom: 15 }}
                        fullWidth
                        onChange={handleChange}
                        value={values.name}
                        id="name"
                        label="Name"
                      />
                      <TextField
                        style={{ marginBottom: 15 }}
                        fullWidth
                        onChange={handleChange}
                        multiline
                        maxRows={3}
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
                        value={values.email}
                        id="email"
                        label="Email"
                      />
                      <TextField
                        style={{ marginBottom: 15 }}
                        fullWidth
                        onChange={handleChange}
                        value={values.company}
                        id="company"
                        label="Company"
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
