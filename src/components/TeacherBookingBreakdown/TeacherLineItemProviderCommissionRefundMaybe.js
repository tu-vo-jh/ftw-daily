import React from 'react';
import { FormattedMessage, intlShape } from '../../util/reactIntl';
import { formatMoney } from '../../util/currency';
import { propTypes, LINE_ITEM_PROVIDER_COMMISSION } from '../../util/types';

import css from './TeacherBookingBreakdown.module.css';

const TeacherLineItemProviderCommissionRefundMaybe = props => {
    const { transaction, isProvider, intl } = props;

    const refund = transaction.attributes.lineItems.find(
        item => item.code === LINE_ITEM_PROVIDER_COMMISSION && item.reversal
    );

    return isProvider && refund ? (
        <div className={css.lineItem}>
            <span className={css.itemLabel}>
                <FormattedMessage id="TeacherBookingBreakdown.refundProviderFee" />
            </span>
            <span className={css.itemValue}>{formatMoney(intl, refund.lineTotal)}</span>
        </div>
    ) : null;
};

TeacherLineItemProviderCommissionRefundMaybe.propTypes = {
    transaction: propTypes.transaction.isRequired,
    intl: intlShape.isRequired,
};

export default TeacherLineItemProviderCommissionRefundMaybe;
