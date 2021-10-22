// material
import { filter } from 'lodash';
import {
  Card,
  Stack,
  Container,
  Button,
  Typography,
  TextField,
  Grid,
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableContainer,
  TablePagination
} from '@material-ui/core';
import { Icon } from '@iconify/react';
import plusFill from '@iconify/icons-eva/plus-fill';
import { useState, useEffect } from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useLocation, Link as RouterLink } from 'react-router-dom';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
// components
import useQuery from '../utils/useQuery';
import Page from '../components/Page';
import Scrollbar from '../components/Scrollbar';
import firebase from '../firebase';
import SearchNotFound from '../components/SearchNotFound';
import { UserListHead, UserListToolbar, UserMoreMenu } from '../components/_dashboard/user';
import { variableDataGet, itemRateDataGet, itemRateDataSet } from '../utils/cache';
import ModalComponents from '../components/ModalComponents';

const UserSchemaValidations = Yup.object().shape({
  driverKms: Yup.string().required('Required'),
  empRate: Yup.string().required('Required'),
  nonableKms: Yup.string().required('Required')
});

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'name', label: 'Item Name', alignRight: false },
  { id: 'rate', label: 'Rate', alignRight: false },
  { id: '' }
];

// ----------------------------------------------------------------------

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function applySortFilter(array, comparator, query) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  if (query) {
    return filter(
      array,
      (_driver) => _driver.name.toLowerCase().indexOf(query.toLowerCase()) !== -1
    );
  }
  return stabilizedThis.map((el) => el[0]);
}

export default function Settings() {
  const location = useLocation();
  const queryString = useQuery(location.search);
  const act = queryString.get('act');
  const [variable, setVariable] = useState(variableDataGet() || []);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [itemRate, setItemRate] = useState([]);
  const [orderBy, setOrderBy] = useState('name');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [openModal, setOpenModal] = useState(false);
  const [uid, setUid] = useState('');

  useEffect(() => {
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
  }, []);

  if (itemRate) {
    itemRateDataSet(itemRate);
  }

  const deleteDriverEach = (id) => {
    setUid(id);
    setOpenModal(true);
  };

  const handleModalClose = () => {
    setOpenModal(false);
  };

  const deleteDriver = () => {
    const itemRates = itemRateDataGet();
    const filteredDeleteItem = itemRates.filter((itemRate) => itemRate.id === uid)[0];
    firebase.firestore().collection('itemrate').doc(filteredDeleteItem.id).set({
      name: filteredDeleteItem?.name,
      rate: filteredDeleteItem?.rate
    });
    setOpenModal(false);
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = itemRate?.map((n) => n.name);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterByName = (event) => {
    setFilterName(event.target.value);
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - itemRate?.length) : 0;

  const filteredItemRate = applySortFilter(itemRate, getComparator(order, orderBy), filterName);

  const isUserNotFound = filteredItemRate.length === 0;

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
      nonableKms: values?.nonableKms,
      itemRate: values?.itemRate
    });
  };

  console.log(variable[0]);

  return (
    <Page title="Settings Menu | Minimal-UI">
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
                  nonableKms: '',
                  itemRate: ''
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
                  <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                    <Typography variant="h4" gutterBottom>
                      Set Item Rate
                    </Typography>
                    <Button
                      variant="contained"
                      component={RouterLink}
                      to="/dashboard/item-rate-manage?act=Add"
                      startIcon={<Icon icon={plusFill} />}
                    >
                      New Item Rate
                    </Button>
                  </Stack>

                  <Card>
                    <UserListToolbar
                      numSelected={selected.length}
                      filterName={filterName}
                      onFilterName={handleFilterByName}
                    />

                    <Scrollbar>
                      <TableContainer sx={{ minWidth: 800 }}>
                        <Table>
                          <UserListHead
                            order={order}
                            orderBy={orderBy}
                            headLabel={TABLE_HEAD}
                            rowCount={itemRate.length}
                            numSelected={selected.length}
                            onRequestSort={handleRequestSort}
                            onSelectAllClick={handleSelectAllClick}
                          />
                          <TableBody>
                            {filteredItemRate
                              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                              .map((row) => {
                                const { id, name, rate } = row;
                                const isItemSelected = selected.indexOf(name) !== -1;

                                return (
                                  <TableRow
                                    hover
                                    key={id}
                                    tabIndex={-1}
                                    role="checkbox"
                                    selected={isItemSelected}
                                    aria-checked={isItemSelected}
                                  >
                                    <TableCell padding="checkbox" />
                                    <TableCell component="th" scope="row" padding="none">
                                      <Stack direction="row" alignItems="center" spacing={2}>
                                        <Typography variant="subtitle2" noWrap>
                                          {name}
                                        </Typography>
                                      </Stack>
                                    </TableCell>
                                    <TableCell align="left">{rate}</TableCell>
                                    <TableCell align="right">
                                      <UserMoreMenu
                                        deleteFunction={() => deleteDriverEach(id)}
                                        linkEdit={`/dashboard/item-rate-manage?act=Edit&id=${id}`}
                                      />
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            {emptyRows > 0 && (
                              <TableRow style={{ height: 53 * emptyRows }}>
                                <TableCell colSpan={6} />
                              </TableRow>
                            )}
                          </TableBody>
                          {isUserNotFound && (
                            <TableBody>
                              <TableRow>
                                <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
                                  <SearchNotFound searchQuery={filterName} />
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          )}
                        </Table>
                      </TableContainer>
                      <ModalComponents
                        title="Delete"
                        message="Are you sure you wish to delete this driver?"
                        open={openModal}
                        handleSubmit={deleteDriver}
                        handleClose={handleModalClose}
                      />
                    </Scrollbar>

                    <TablePagination
                      rowsPerPageOptions={[5, 10, 25]}
                      component="div"
                      count={itemRate.length}
                      rowsPerPage={rowsPerPage}
                      page={page}
                      onPageChange={handleChangePage}
                      onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                  </Card>
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
