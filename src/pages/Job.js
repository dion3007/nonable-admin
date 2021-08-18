import { filter } from 'lodash';
import { Icon } from '@iconify/react';
import { useState, useEffect } from 'react';
import plusFill from '@iconify/icons-eva/plus-fill';
import { Link as RouterLink } from 'react-router-dom';
import moment from 'moment';
// material
import {
  Card,
  Table,
  Stack,
  Button,
  Checkbox,
  TableRow,
  TableBody,
  TableCell,
  Container,
  Typography,
  Grid,
  TableContainer,
  TablePagination
} from '@material-ui/core';
import firebase from '../firebase';
// components
import Page from '../components/Page';
import Scrollbar from '../components/Scrollbar';
import SearchNotFound from '../components/SearchNotFound';
import { UserListHead, UserListToolbar, UserMoreMenu } from '../components/_dashboard/user';
import { jobDataSet, driverDataSet, clientDataSet } from '../utils/cache';
import { AppNewUsers, AppItemOrders, AppWeeklySales } from '../components/_dashboard/app';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'customerName', label: 'Customer Name', alignRight: false },
  { id: 'pickUp', label: 'From', alignRight: false },
  { id: 'dropOff', label: 'Destination', alignRight: false },
  { id: 'price', label: 'Amount', alignRight: false },
  { id: 'driver', label: 'Driver', alignRight: false },
  { id: 'paid', label: 'Paid Status', alignRight: false },
  { id: 'date', label: 'Booking Date', alignRight: false },
  { id: 'time', label: 'Time', alignRight: false },
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
    return filter(array, (_job) => _job.customer.toLowerCase().indexOf(query.toLowerCase()) !== -1);
  }
  return stabilizedThis.map((el) => el[0]);
}

export default function Job() {
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [clients, setClients] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [orderBy, setOrderBy] = useState('name');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
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
      .collection('clients')
      .onSnapshot((snapshot) => {
        const newClient = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
        setClients(newClient);
      });
    if (jobs) {
      jobDataSet(jobs);
    }
  }, [jobs]);

  const addToLocalStorage = () => {
    clientDataSet(clients);
    driverDataSet(drivers);
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = jobs?.map((n) => n.name);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
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

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - jobs?.length) : 0;

  const filteredJobs = applySortFilter(jobs, getComparator(order, orderBy), filterName);

  const isUserNotFound = filteredJobs.length === 0;

  // const jobsList = filteredJobs.reduce((p, c) => {
  //   p[new Date(c.bookingDate).toLocaleDateString('en-US')] =
  //     (p[new Date(c.booking_date).toLocaleDateString('en-US')] || 0) + 1;
  //   return p;
  // }, {});

  // const result = filteredJobs.filter(
  //   (obj) => jobsList[new Date(obj.bookingDate).toLocaleDateString('en-US')] > 1
  // );

  // console.log(result);

  return (
    <Page title="Bookings | Minimal-UI">
      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Booking
          </Typography>
          <Button
            variant="contained"
            component={RouterLink}
            onClick={addToLocalStorage}
            to="/dashboard/booking-manage?act=Add"
            startIcon={<Icon icon={plusFill} />}
          >
            New Booking
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
                  rowCount={jobs.length}
                  numSelected={selected.length}
                  onRequestSort={handleRequestSort}
                  onSelectAllClick={handleSelectAllClick}
                />
                <TableBody>
                  {filteredJobs
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row) => {
                      const { id, customer, pickUp, dropOff, price, paid, bookingDate, driver } =
                        row;
                      const isItemSelected = selected.indexOf(customer) !== -1;

                      return (
                        <TableRow
                          hover
                          key={id}
                          tabIndex={-1}
                          role="checkbox"
                          selected={isItemSelected}
                          aria-checked={isItemSelected}
                        >
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={isItemSelected}
                              onChange={(event) => handleClick(event, customer)}
                            />
                          </TableCell>
                          <TableCell component="th" scope="row" padding="none">
                            <Stack direction="row" alignItems="center" spacing={2}>
                              <Typography variant="subtitle2" noWrap>
                                {clients?.filter((client) => client.id === customer)[0]?.name}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell align="left">{pickUp}</TableCell>
                          <TableCell align="left">{dropOff}</TableCell>
                          <TableCell align="left">{price}</TableCell>
                          <TableCell align="left">
                            {drivers?.filter((driverData) => driverData.id === driver)[0]?.name}
                          </TableCell>
                          <TableCell align="left">{paid ? 'paid' : 'no paid'}</TableCell>
                          <TableCell align="left">
                            {moment(bookingDate).format('DD-MM-YYYY')}
                          </TableCell>
                          <TableCell align="left">
                            {moment(bookingDate).format('hh:mm A')}
                          </TableCell>
                          <TableCell align="right">
                            <UserMoreMenu
                              linkEdit={`/dashboard/booking-manage?act=Edit&id=${id}`}
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
          </Scrollbar>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={jobs.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
      </Container>
      <Container style={{ marginTop: 20 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <AppWeeklySales />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <AppNewUsers />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <AppItemOrders />
          </Grid>
        </Grid>
      </Container>
    </Page>
  );
}
