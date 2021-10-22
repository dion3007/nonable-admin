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
import { itemRateDataGet } from '../utils/cache';

const UserSchemaValidations = Yup.object().shape({
  name: Yup.string().required('Required'),
  rate: Yup.string().required('Required')
});

export default function AddEditItemRate() {
  const location = useLocation();
  const queryString = useQuery(location.search);
  const act = queryString.get('act');
  const id = queryString.get('id');
  const [itemRate, setItemRate] = useState(itemRateDataGet() || []);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  useEffect(() => {
    if (act === 'Edit') {
      firebase
        .firestore()
        .collection('itemrate')
        .onSnapshot((snapshot) => {
          const newItem = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
          }));
          setItemRate(newItem);
        });
    }
  }, [act]);

  const filteredItemRate = itemRate.filter((item) => id === item.id);

  const handleSubmit = (values) => {
    if (act === 'Add') {
      firebase.firestore().collection('itemrate').add({
        name: values.name,
        rate: values.rate
      });
    } else {
      firebase.firestore().collection('itemrate').doc(filteredItemRate[0].id).set({
        name: values?.name,
        rate: values?.rate
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
            {act} Item Rate
          </Typography>
        </Stack>
        <Card>
          <Scrollbar>
            <Formik
              initialValues={
                filteredItemRate[0] || {
                  name: '',
                  rate: ''
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
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        required
                        style={{ marginBottom: 15 }}
                        fullWidth
                        error={errors?.rate && true}
                        helperText={errors?.rate}
                        onChange={handleChange}
                        value={values.rate}
                        id="rate"
                        label="Rate"
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
