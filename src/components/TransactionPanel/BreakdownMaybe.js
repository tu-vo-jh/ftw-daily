import React from 'react';
import classNames from 'classnames';
import config from '../../config';
import { DATE_TYPE_DATETIME } from '../../util/types';
import { TeacherBookingBreakdown, BookingBreakdown } from '../../components';

import css from './TransactionPanel.module.css';

// Functional component as a helper to build BookingBreakdown
const BreakdownMaybe = props => {
  const { className, rootClassName, breakdownClassName, transaction, transactionRole } = props;
  const loaded = transaction && transaction.id && transaction.booking && transaction.booking.id;

  const classes = classNames(rootClassName || css.breakdownMaybe, className);
  const breakdownClasses = classNames(breakdownClassName || css.breakdown);

  const isTeacherListing = transaction && transaction.listing && transaction.listing.attributes.publicData.subjects && transaction.listing.attributes.publicData.subjects.length;

  return loaded ? (
    <div className={classes}>
      {isTeacherListing ? (
        <TeacherBookingBreakdown
          className={breakdownClasses}
          userRole={transactionRole}
          unitType={config.bookingUnitType}
          transaction={transaction}
          booking={transaction.booking}
          dateType={DATE_TYPE_DATETIME}
        />) :
        (<BookingBreakdown
          className={breakdownClasses}
          userRole={transactionRole}
          unitType={config.bookingUnitType}
          transaction={transaction}
          booking={transaction.booking}
          dateType={DATE_TYPE_DATETIME}
        />)}
    </div>
  ) : null;
};

export default BreakdownMaybe;
