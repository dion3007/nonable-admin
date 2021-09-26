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
import { useLocation } from 'react-router-dom';
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
import { userDataGet } from '../utils/cache';

const UserSchemaValidations = Yup.object().shape({
  name: Yup.string().required('Required'),
  email: Yup.string().email('Invalid email').required('Required'),
  role: Yup.string().required('Required'),
  password: Yup.string().required('Required')
});

export default function AddEditUsers() {
  const location = useLocation();
  const queryString = useQuery(location.search);
  const act = queryString.get('act');
  const id = queryString.get('id');
  const [users, setUsers] = useState(userDataGet() || []);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (act === 'Edit') {
      firebase
        .firestore()
        .collection('users')
        .onSnapshot((snapshot) => {
          const newUsers = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
          }));
          setUsers(newUsers);
        });
    }
  }, [act]);

  const filteredUsers = users.filter((user) => id === user.id);

  const handleSubmit = (values) => {
    if (act === 'Add') {
      firebase.auth().createUserWithEmailAndPassword(values.email, values.password);
      firebase.firestore().collection('users').add({
        name: values.name,
        email: values.email,
        avatarUrl: values.avatarUrl,
        role: values.role,
        password: values.password,
        status: 'active'
      });
    } else {
      firebase
        .firestore()
        .collection('users')
        .doc(filteredUsers[0].id)
        .set({
          name: values?.name,
          email: values?.email,
          avatarUrl: values?.avatarUrl || 'test',
          role: values?.role,
          password: values?.password,
          status: 'active'
        });
    }
  };

  return (
    <Page title="Users | Minimal-UI">
      <Container maxWidth={false}>
        <Snackbar open={openSnackbar} autoHideDuration={300}>
          <MuiAlert elevation={6} variant="filled" severity="success" sx={{ width: '100%' }}>
            Success submit data.
          </MuiAlert>
        </Snackbar>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            {act} Users
          </Typography>
        </Stack>
        <Card>
          <Scrollbar>
            <Formik
              initialValues={
                filteredUsers[0] || {
                  name: '',
                  email: '',
                  avatarUrl: '',
                  role: '',
                  password: ''
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
                        style={{ marginBottom: 15 }}
                        fullWidth
                        onChange={handleChange}
                        multiline
                        maxRows={3}
                        value={values.avatarUrl}
                        id="avatarUrl"
                        label="Avatar Url"
                      />
                    </Grid>
                    <Grid item xs={6}>
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
                        select
                        required
                        error={errors?.role && true}
                        style={{ marginBottom: 15, textAlign: 'left' }}
                        fullWidth
                        helperText={errors?.role}
                        onChange={handleChange('role')}
                        value={values.role}
                        id="role"
                        label="Role"
                      >
                        <MenuItem key="1" value="admin">
                          Admin
                        </MenuItem>
                        <MenuItem key="2" value="superadmin">
                          Super Admin
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
