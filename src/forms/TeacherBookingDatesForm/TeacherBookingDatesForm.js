import React, { Component } from 'react';
import { string, bool, arrayOf, array, func } from 'prop-types';
import { compose } from 'redux';
import { Form as FinalForm, FormSpy } from 'react-final-form';
import classNames from 'classnames';
import moment from 'moment';
import config from '../../config';
import { FormattedMessage, intlShape, injectIntl } from '../../util/reactIntl';
import { required, composeValidators, bookingDateRequired } from '../../util/validators';
import { START_DATE, END_DATE } from '../../util/dates';
import { propTypes } from '../../util/types';
import { Form, IconSpinner, PrimaryButton, FieldDateInput, FieldSelect } from '../../components';
import TeacherEstimatedBreakdownMaybe from './TeacherEstimatedBreakdownMaybe';
import _ from 'lodash';

import css from './TeacherBookingDatesForm.module.css';
import { getStartTimeOptions } from '../../util/data';

const identity = v => v;

export class TeacherBookingDatesFormComponent extends Component {
    constructor(props) {
        super(props);
        this.state = { focusedInput: null };
        this.handleFormSubmit = this.handleFormSubmit.bind(this);
        this.onFocusedInputChange = this.onFocusedInputChange.bind(this);
        this.handleOnChange = this.handleOnChange.bind(this);
        this.getDateTimeBooking = this.getDateTimeBooking.bind(this);
    }

    // Function that can be passed to nested components
    // so that they can notify this component when the
    // focused input changes.
    onFocusedInputChange(focusedInput) {
        this.setState({ focusedInput });
    }

    // In case start or end date for the booking is missing
    // focus on that input, otherwise continue with the
    // default handleSubmit function.
    handleFormSubmit(e) {
        const { bookingDates, startTime, endTime } = e || {};
        if (!bookingDates.date) {
            e.preventDefault();
        } else {
            this.props.onSubmit({ bookingDates: this.getDateTimeBooking(bookingDates.date, startTime, endTime) });
        }
    }

    // When the values of the form are updated we need to fetch
    // lineItems from FTW backend for the EstimatedTransactionMaybe
    // In case you add more fields to the form, make sure you add
    // the values here to the bookingData object.
    handleOnChange(formValues) {
        const { date } =
            formValues.values && formValues.values.bookingDates ? formValues.values.bookingDates : {};
        const { startTime, endTime } = formValues.values ? formValues.values : {};

        const listingId = this.props.listingId;
        const isOwnListing = this.props.isOwnListing;

        const { startDate, endDate } = this.getDateTimeBooking(date, startTime, endTime);

        if (startDate && endDate && !this.props.fetchLineItemsInProgress) {
            this.props.onFetchTransactionLineItems({
                bookingData: { startDate, endDate },
                listingId,
                isOwnListing,
            });
        }
    }

    getDateTimeBooking(date, from, to) {
        if (!date) {
            return {};
        }

        const startDate = from ? new Date(date.setHours(from)) : date;

        let temp = new Date(date);
        temp.setDate(temp.getDate() + 1);
        to && temp.setHours(to);

        const endDate = new Date(temp);

        return { startDate, endDate }
    }

    render() {
        const { rootClassName, className, price: unitPrice, ...rest } = this.props;
        const classes = classNames(rootClassName || css.root, className);

        if (!unitPrice) {
            return (
                <div className={classes}>
                    <p className={css.error}>
                        <FormattedMessage id="BookingDatesForm.listingPriceMissing" />
                    </p>
                </div>
            );
        }
        if (unitPrice.currency !== config.currency) {
            return (
                <div className={classes}>
                    <p className={css.error}>
                        <FormattedMessage id="BookingDatesForm.listingCurrencyInvalid" />
                    </p>
                </div>
            );
        }

        return (
            <FinalForm
                {...rest}
                unitPrice={unitPrice}
                onSubmit={this.handleFormSubmit}
                render={fieldRenderProps => {
                    const {
                        placeholder,
                        formId,
                        handleSubmit,
                        intl,
                        isOwnListing,
                        submitButtonWrapperClassName,
                        unitType,
                        values,
                        timeSlots,
                        fetchTimeSlotsError,
                        lineItems,
                        fetchLineItemsInProgress,
                        fetchLineItemsError,
                        listing
                    } = fieldRenderProps;
                    const { date } = values && values.bookingDates ? values.bookingDates : {};

                    const sessionHour = listing && listing.attributes.publicData.numberOfHours ? +listing.attributes.publicData.numberOfHours : 8;
                    const startTimeOptions = sessionHour === 8 ? [{ key: '8', label: '8:00' }] : getStartTimeOptions(sessionHour);

                    const { startTime, endTime } = values ? values : {};
                    const { startDate, endDate } = this.getDateTimeBooking(date, startTime, endTime);

                    const bookingStartLabel = intl.formatMessage({
                        id: 'BookingDatesForm.bookingStartTitle',
                    });

                    const requiredMessage = intl.formatMessage({
                        id: 'BookingDatesForm.requiredDate',
                    });

                    const startDateErrorMessage = intl.formatMessage({
                        id: 'FieldDateRangeInput.invalidStartDate',
                    });

                    const timeSlotsError = fetchTimeSlotsError ? (
                        <p className={css.sideBarError}>
                            <FormattedMessage id="BookingDatesForm.timeSlotsError" />
                        </p>
                    ) : null;

                    // This is the place to collect breakdown estimation data.
                    // Note: lineItems are calculated and fetched from FTW backend
                    // so we need to pass only booking data that is needed otherwise
                    // If you have added new fields to the form that will affect to pricing,
                    // you need to add the values to handleOnChange function
                    const bookingData =
                        startDate && endDate
                            ? {
                                unitType,
                                startDate,
                                endDate,
                                sessionHour,
                                startTime,
                                endTime
                            }
                            : null;

                    const showEstimatedBreakdown =
                        bookingData && lineItems && startTime && endTime && !fetchLineItemsInProgress && !fetchLineItemsError;

                    const bookingInfoMaybe = showEstimatedBreakdown ? (
                        <div className={css.priceBreakdownContainer}>
                            <h3 className={css.priceBreakdownTitle}>
                                <FormattedMessage id="BookingDatesForm.priceBreakdownTitle" />
                            </h3>
                            <TeacherEstimatedBreakdownMaybe bookingData={bookingData} lineItems={lineItems} />
                        </div>
                    ) : null;

                    const loadingSpinnerMaybe = fetchLineItemsInProgress ? (
                        <IconSpinner className={css.spinner} />
                    ) : null;

                    const bookingInfoErrorMaybe = fetchLineItemsError ? (
                        <span className={css.sideBarError}>
                            <FormattedMessage id="BookingDatesForm.fetchLineItemsError" />
                        </span>
                    ) : null;

                    const dateFormatOptions = {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                    };

                    const now = moment();
                    const today = now.startOf('day').toDate();
                    const placeholderText =
                        placeholder || intl.formatDate(today, dateFormatOptions);
                    const submitButtonClasses = classNames(
                        submitButtonWrapperClassName || css.submitButtonWrapper
                    );

                    const startTimeLabel = intl.formatMessage({
                        id: 'TeacherBookingDatesForm.startTimeLabel',
                    });

                    const endTimeLabel = intl.formatMessage({
                        id: 'TeacherBookingDatesForm.endTimeLabel',
                    });

                    return (
                        <Form onSubmit={handleSubmit} className={classes} enforcePagePreloadFor="CheckoutPage">
                            {timeSlotsError}
                            <FormSpy
                                subscription={{ values: true }}
                                onChange={values => {
                                    this.handleOnChange(values);
                                }}
                            />
                            <FieldDateInput
                                className={css.bookingDates}
                                name="bookingDates"
                                id={`${formId}.bookingStartDate`}
                                label={bookingStartLabel}
                                placeholderText={placeholderText}
                                format={identity}
                                timeSlots={timeSlots}
                                useMobileMargins
                                validate={composeValidators(
                                    required(requiredMessage),
                                    bookingDateRequired(startDateErrorMessage)
                                )}
                                disabled={fetchLineItemsInProgress}
                            />

                            <div className={css.timeRange}>
                                <FieldSelect
                                    name="startTime"
                                    id="startTime"
                                    label={startTimeLabel}
                                    className={css.startTime}
                                    defaultValue={startTimeOptions[0].key}
                                >
                                    <option disabled value="">
                                    </option>
                                    {startTimeOptions.map(c => (
                                        <option key={c.key} value={c.key}>
                                            {c.label}
                                        </option>
                                    ))}
                                </FieldSelect>

                                <FormSpy subscription={{ values: true }}>
                                    {({ values }) => {
                                        const endTimeOption = { key: (+values.startTime + sessionHour).toString(), label: `${(+values.startTime + sessionHour)}:00` };
                                        return (
                                            <FieldSelect
                                                name="endTime"
                                                id="endTime"
                                                label={endTimeLabel}
                                                className={css.endTime}
                                                defaultValue={endTimeOption.key}
                                            >
                                                {endTimeOption && !!parseInt(endTimeOption.key) ? (
                                                    <option key={endTimeOption.key} value={endTimeOption.key}>
                                                        {endTimeOption.label}
                                                    </option>
                                                ) : null
                                                }
                                            </FieldSelect>
                                        )
                                    }}
                                </FormSpy>
                            </div>


                            {bookingInfoMaybe}
                            {loadingSpinnerMaybe}
                            {bookingInfoErrorMaybe}

                            <p className={css.smallPrint}>
                                <FormattedMessage
                                    id={
                                        isOwnListing
                                            ? 'BookingDatesForm.ownListing'
                                            : 'BookingDatesForm.youWontBeChargedInfo'
                                    }
                                />
                            </p>
                            <div className={submitButtonClasses}>
                                <PrimaryButton type="submit">
                                    <FormattedMessage id="BookingDatesForm.requestToBook" />
                                </PrimaryButton>
                            </div>
                        </Form>
                    );
                }}
            />
        );
    }
}

TeacherBookingDatesFormComponent.defaultProps = {
    rootClassName: null,
    className: null,
    submitButtonWrapperClassName: null,
    price: null,
    isOwnListing: false,
    placeholder: null,
    timeSlots: null,
    lineItems: null,
    fetchLineItemsError: null,
};

TeacherBookingDatesFormComponent.propTypes = {
    rootClassName: string,
    className: string,
    submitButtonWrapperClassName: string,

    unitType: propTypes.bookingUnitType.isRequired,
    price: propTypes.money,
    isOwnListing: bool,
    timeSlots: arrayOf(propTypes.timeSlot),

    onFetchTransactionLineItems: func.isRequired,
    lineItems: array,
    fetchLineItemsInProgress: bool.isRequired,
    fetchLineItemsError: propTypes.error,

    // from injectIntl
    intl: intlShape.isRequired,

    // for tests
    placeholder: string,
};

const TeacherBookingDatesForm = compose(injectIntl)(TeacherBookingDatesFormComponent);
TeacherBookingDatesForm.displayName = 'TeacherBookingDatesForm';

export default TeacherBookingDatesForm;
