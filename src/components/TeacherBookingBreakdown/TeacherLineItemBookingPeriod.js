import React from 'react';
import { FormattedMessage, FormattedDate } from '../../util/reactIntl';
import moment from 'moment';
import { LINE_ITEM_NIGHT, DATE_TYPE_DATE, propTypes } from '../../util/types';

import css from './TeacherBookingBreakdown.module.css';

const TeacherBookingPeriod = props => {
  const { startDate, endDate, dateType } = props;

  const timeFormatOptions =
    dateType === DATE_TYPE_DATE
      ? {
        weekday: 'long',
      }
      : {
        weekday: 'short',
        hour: 'numeric',
        minute: 'numeric',
      };

  const dateFormatOptions = {
    month: 'short',
    day: 'numeric',
  };

  return (
    <>
      <div className={css.bookingPeriod}>
        <div className={css.bookingPeriodSection}>
          <div className={css.dayLabel}>
            <FormattedMessage id="BookingBreakdown.bookingStart" />
          </div>
          <div className={css.dayInfo}>
            <FormattedDate value={startDate} {...timeFormatOptions} />
          </div>
          <div className={css.itemLabel}>
            <FormattedDate value={startDate} {...dateFormatOptions} />
          </div>
        </div>

        <div className={css.bookingPeriodSectionRigth}>
          <div className={css.dayLabel}>
            <FormattedMessage id="BookingBreakdown.bookingEnd" />
          </div>
          <div className={css.dayInfo}>
            <FormattedDate value={endDate} {...timeFormatOptions} />
          </div>
          <div className={css.itemLabel}>
            <FormattedDate value={endDate} {...dateFormatOptions} />
          </div>
        </div>
      </div>
    </>
  );
};

const TeacherLineItemBookingPeriod = props => {
  const { booking, unitType, dateType } = props;

  // Attributes: displayStart and displayEnd can be used to differentiate shown time range
  // from actual start and end times used for availability reservation. It can help in situations
  // where there are preparation time needed between bookings.
  // Read more: https://www.sharetribe.com/api-reference/marketplace.html#bookings
  const { start, end, displayStart, displayEnd } = booking.attributes;
  const localStartDate = displayStart || start;
  const localEndDateRaw = displayEnd || end;

  const isNightly = unitType === LINE_ITEM_NIGHT;
  const endDay = isNightly ? localEndDateRaw : moment(localEndDateRaw).subtract(1, 'days');

  return (
    <>
      <div className={css.lineItem}>
        <TeacherBookingPeriod startDate={localStartDate} endDate={endDay} dateType={dateType} />
      </div>
      <hr className={css.totalDivider} />
    </>
  );
};
TeacherLineItemBookingPeriod.defaultProps = { dateType: null };

TeacherLineItemBookingPeriod.propTypes = {
  booking: propTypes.booking.isRequired,
  dateType: propTypes.dateType,
};

export default TeacherLineItemBookingPeriod;
