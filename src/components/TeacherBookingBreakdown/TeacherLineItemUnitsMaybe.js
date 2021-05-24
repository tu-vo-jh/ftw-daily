import React from 'react';
import { FormattedMessage } from '../../util/reactIntl';
import { LINE_ITEM_UNITS, propTypes } from '../../util/types';

import css from './TeacherBookingBreakdown.module.css';

const TeacherLineItemUnitsMaybe = props => {
    const { transaction, unitType } = props;

    if (unitType !== LINE_ITEM_UNITS) {
        return null;
    }

    const unitPurchase = transaction.attributes.lineItems.find(
        item => item.code === unitType && !item.reversal
    );

    if (!unitPurchase) {
        throw new Error(`TeacherLineItemUnitsMaybe: lineItem (${unitType}) missing`);
    }

    const quantity = unitPurchase.quantity;

    return (
        <div className={css.lineItem}>
            <span className={css.itemLabel}>
                <FormattedMessage id="BookingBreakdown.quantityUnit" />
            </span>
            <span className={css.itemValue}>
                <FormattedMessage id="BookingBreakdown.quantity" values={{ quantity }} />
            </span>
        </div>
    );
};

TeacherLineItemUnitsMaybe.propTypes = {
    transaction: propTypes.transaction.isRequired,
    unitType: propTypes.bookingUnitType.isRequired,
};

export default TeacherLineItemUnitsMaybe;
