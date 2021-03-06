import { Icon } from '@iconify/react';
// import pieChart2Fill from '@iconify/icons-eva/pie-chart-2-fill';
import peopleFill from '@iconify/icons-eva/people-fill';
import personAddFill from '@iconify/icons-eva/person-add-fill';
import pricetagsFill from '@iconify/icons-eva/pricetags-fill';
import briefcaseOutline from '@iconify/icons-eva/bookmark-outline';
import clipboardFill from '@iconify/icons-eva/clipboard-fill';
// import fileTextFill from '@iconify/icons-eva/file-text-fill';
// import lockFill from '@iconify/icons-eva/lock-fill';
// import alertTriangleFill from '@iconify/icons-eva/alert-triangle-fill';

// ----------------------------------------------------------------------

const getIcon = (name) => <Icon icon={name} width={22} height={22} />;

const sidebarConfig = [
  // {
  //   title: 'dashboard',
  //   path: '/dashboard/app',
  //   icon: getIcon(pieChart2Fill)
  // },
  {
    title: 'booking',
    path: '/dashboard/booking',
    icon: getIcon(briefcaseOutline)
  },
  {
    title: 'user',
    path: '/dashboard/user',
    icon: getIcon(personAddFill)
  },
  {
    title: 'Employee',
    path: '/dashboard/driver',
    icon: getIcon(peopleFill)
  },
  {
    title: 'client',
    path: '/dashboard/client',
    icon: getIcon(pricetagsFill)
  },
  {
    title: 'generate report',
    path: '/dashboard/ndis-report',
    icon: getIcon(clipboardFill)
  }
  // {
  //   title: 'login',
  //   path: '/login',
  //   icon: getIcon(lockFill)
  // },
  // {
  //   title: 'register',
  //   path: '/register',
  //   icon: getIcon(personAddFill)
  // },
  // {
  //   title: 'Not found',
  //   path: '/404',
  //   icon: getIcon(alertTriangleFill)
  // }
];

export default sidebarConfig;
