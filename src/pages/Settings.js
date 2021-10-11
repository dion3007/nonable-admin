// material
import { Card, Stack, Container, Button, Typography, TextField, Grid } from '@material-ui/core';
import { useState, useEffect } from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useLocation } from 'react-router-dom';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
// components
import useQuery from '../utils/useQuery';
import Page from '../components/Page';
import Scrollbar from '../components/Scrollbar';
import firebase from '../firebase';
import { variableDataGet } from '../utils/cache';

const UserSchemaValidations = Yup.object().shape({
  driverKms: Yup.string().required('Required'),
  empRate: Yup.string().required('Required'),
  nonableKms: Yup.string().required('Required')
});

export default function Settings() {
  const location = useLocation();
  const queryString = useQuery(location.search);
  const act = queryString.get('act');
  const [variable, setVariable] = useState(variableDataGet() || []);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  useEffect(() => {
    if (act === 'Edit') {
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
    }
  }, [act]);

  const handleSubmit = (values) => {
    firebase.firestore().collection('variable').doc(variable[0].id).set({
      driverKms: values?.driverKms,
      empRate: values?.empRate,
      nonableKms: values?.nonableKms
    });
  };

  console.log(variable[0]);

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
            Set Variable
          </Typography>
        </Stack>
        <Card>
          <Scrollbar>
            <Formik
              initialValues={
                variable[0] || {
                  driverKms: '',
                  empRate: '',
                  nonableKms: ''
                }
              }
              validationSchema={UserSchemaValidations}
              onSubmit={(values, { setSubmitting }) => {
                setOpenSnackbar(true);
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
                        error={errors?.driverKms && true}
                        style={{ marginBottom: 15 }}
                        fullWidth
                        helperText={errors?.driverKms}
                        onChange={handleChange}
                        value={values.driverKms}
                        id="driverKms"
                        label="Driver Kms"
                      />
                      <TextField
                        required
                        error={errors?.empRate && true}
                        style={{ marginBottom: 15 }}
                        fullWidth
                        helperText={errors?.empRate}
                        onChange={handleChange}
                        value={values.empRate}
                        id="empRate"
                        label="Employee Rate"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        required
                        error={errors?.nonableKms && true}
                        style={{ marginBottom: 15 }}
                        fullWidth
                        helperText={errors?.nonableKms}
                        onChange={handleChange}
                        value={values.nonableKms}
                        id="nonableKms"
                        label="Nonabel Kms"
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
