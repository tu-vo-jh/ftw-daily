const { calculateQuantityFromDates, calculateTotalFromLineItems, calculateTotalForCustomer } = require('./lineItemHelpers');
const { types } = require('sharetribe-flex-sdk');
const { LINE_ITEM_PROVIDER_COMMISSION, LINE_ITEM_CUSTOMER_COMMISSION } = require('../../src/util/types');
const { Money } = types;

// This bookingUnitType needs to be one of the following:
// line-item/night, line-item/day or line-item/units
const bookingUnitType = 'line-item/night';
const PROVIDER_COMMISSION_PERCENTAGE = -25;
const CUSTOMER_COMMISSION_PERCENTAGE = -15;

/** Returns collection of lineItems (max 50)
 *
 * Each line items has following fields:
 * - `code`: string, mandatory, indentifies line item type (e.g. \"line-item/cleaning-fee\"), maximum length 64 characters.
 * - `unitPrice`: money, mandatory
 * - `lineTotal`: money
 * - `quantity`: number
 * - `percentage`: number (e.g. 15.5 for 15.5%)
 * - `seats`: number
 * - `units`: number
 * - `includeFor`: array containing strings \"customer\" or \"provider\", default [\":customer\"  \":provider\" ]
 *
 * Line item must have either `quantity` or `percentage` or both `seats` and `units`.
 *
 * `includeFor` defines commissions. Customer commission is added by defining `includeFor` array `["customer"]` and provider commission by `["provider"]`.
 *
 * @param {Object} listing
 * @param {Object} bookingData
 * @returns {Array} lineItems
 */
exports.transactionLineItems = (listing, bookingData) => {
  const unitPrice = listing.attributes.price;
  const { startDate, endDate } = bookingData;
  const publicData = listing.attributes.publicData;
  const sessionHour = publicData && publicData.numberOfHours;

  /**
   * If you want to use pre-defined component and translations for printing the lineItems base price for booking,
   * you should use one of the codes:
   * line-item/night, line-item/day or line-item/units (translated to persons).
   *
   * Pre-definded commission components expects line item code to be one of the following:
   * 'line-item/provider-commission', 'line-item/customer-commission'
   *
   * By default BookingBreakdown prints line items inside LineItemUnknownItemsMaybe if the lineItem code is not recognized. */

  const booking = !sessionHour ? {
    code: bookingUnitType,
    unitPrice,
    quantity: calculateQuantityFromDates(startDate, endDate, bookingUnitType),
    includeFor: ['customer', 'provider'],
  } : {
    code: bookingUnitType,
    unitPrice,
    quantity: sessionHour,
    includeFor: ['customer', 'provider']
  };

  const providerCommission = {
    code: LINE_ITEM_PROVIDER_COMMISSION,
    unitPrice: calculateTotalFromLineItems([booking]),
    percentage: PROVIDER_COMMISSION_PERCENTAGE,
    includeFor: ['provider'],
  };

  const customerCommission = {
    code: LINE_ITEM_CUSTOMER_COMMISSION,
    unitPrice: calculateTotalForCustomer([booking]),
    percentage: CUSTOMER_COMMISSION_PERCENTAGE,
    includeFor: ['customer']
  }

  const lineItems = [booking, providerCommission, customerCommission];

  return lineItems;
};
