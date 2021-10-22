import { filter } from 'lodash';
import { useState, useEffect } from 'react';
// material
import {
  Card,
  Table,
  Stack,
  TableRow,
  TableBody,
  TableCell,
  Container,
  Typography,
  TableContainer,
  TablePagination
} from '@material-ui/core';
import firebase from '../firebase';
// components
import Page from '../components/Page';
import Scrollbar from '../components/Scrollbar';
import SearchNotFound from '../components/SearchNotFound';
import { UserListHead, UserListToolbar } from '../components/_dashboard/user';
import { clientDataGet, itemRateDataGet } from '../utils/cache';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'client', label: 'Client', alignRight: false },
  { id: 'itemNumber', label: 'Item Number', alignRight: false },
  { id: 'rate', label: 'Rate', alignRight: false },
  { id: 'amount', label: 'Amount', alignRight: false },
  { id: 'date', label: 'Date', alignRight: false },
  { id: 'hours', label: 'Hours', alignRight: false },
  { id: 'planManager', label: 'Plan Manager', alignRight: false },
  { id: 'tax', label: 'Tax (Free)', alignRight: false },
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
      (_ndis) => _ndis.itemNumber.toLowerCase().indexOf(query.toLowerCase()) !== -1
    );
  }
  return stabilizedThis.map((el) => el[0]);
}

export default function Ndis() {
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [ndis, setNdis] = useState([]);
  const [itemRate, setItemRate] = useState(itemRateDataGet() || []);
  const [clients, setClients] = useState(clientDataGet() || []);
  const [orderBy, setOrderBy] = useState('itemNumber');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    firebase
      .firestore()
      .collection('jobs')
      .onSnapshot((snapshot) => {
        const newNdis = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
        setNdis(newNdis);
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
  }, []);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = ndis?.map((n) => n.name);
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

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - ndis?.length) : 0;

  const filteredNdis = applySortFilter(ndis, getComparator(order, orderBy), filterName);

  const isUserNotFound = filteredNdis.length === 0;

  return (
    <Page title="Client | Minimal-UI">
      <Container maxWidth={false}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Ndis
          </Typography>
          {/* <Button
            variant="contained"
            component={RouterLink}
            to="/dashboard/client-manage?act=Add"
            startIcon={<Icon icon={plusFill} />}
          >
            New Ndis
          </Button> */}
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
                  rowCount={ndis.length}
                  numSelected={selected.length}
                  onRequestSort={handleRequestSort}
                  onSelectAllClick={handleSelectAllClick}
                />
                <TableBody>
                  {filteredNdis
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row) => {
                      const { id, bookingDate, hour, item, price, profit, customer } = row;
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
                          <TableCell padding="checkbox" />
                          <TableCell component="th" scope="row" padding="none">
                            <Stack direction="row" alignItems="center" spacing={2}>
                              <Typography variant="subtitle2" noWrap>
                                {clients.filter((client) => client.id === customer)[0]?.name}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell align="left">
                            {itemRate.filter((items) => items.id === item)[0]?.name}
                          </TableCell>
                          <TableCell align="left">{price}</TableCell>
                          <TableCell align="left">{profit}</TableCell>
                          <TableCell align="left">{bookingDate}</TableCell>
                          <TableCell align="left">{hour}</TableCell>
                          <TableCell align="left">
                            {clients.filter((client) => client.id === customer)[0]
                              ?.planManagementDetail === 1 && 'Plan Management'}
                            {clients.filter((client) => client.id === customer)[0]
                              ?.planManagementDetail === 0 && 'Ndis Management'}
                          </TableCell>
                          <TableCell align="left">0</TableCell>
                          {/* <TableCell align="left">
                            <Label
                              variant="ghost"
                              color={(status === 'banned' && 'error') || 'success'}
                            >
                              {sentenceCase(status)}
                            </Label>
                          </TableCell> */}

                          {/* <TableCell align="right">
                            <UserMoreMenu linkEdit={`/dashboard/client-manage?act=Edit&id=${id}`} />
                          </TableCell> */}
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
            count={ndis.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
      </Container>
    </Page>
  );
}
