import React from 'react';
import { bool, func, object, string } from 'prop-types';
import classNames from 'classnames';
import { FormattedMessage } from '../../util/reactIntl';
import { ensureOwnListing } from '../../util/data';
import { LISTING_STATE_DRAFT } from '../../util/types';
import { ListingLink } from '../../components';
import { EditListingGeneralForm } from '../../forms';
import config from '../../config';

import css from './EditListingGeneralPanel.module.css';
import { findOptionsForSelectFilter } from '../../util/search';

const EditListingGeneralPanel = props => {
    const {
        className,
        rootClassName,
        listing,
        disabled,
        ready,
        onSubmit,
        onChange,
        submitButtonText,
        panelUpdated,
        updateInProgress,
        errors,
    } = props;

    const classes = classNames(rootClassName || css.root, className);
    const currentListing = ensureOwnListing(listing);
    const { description, title, publicData } = currentListing.attributes;

    const isPublished = currentListing.id && currentListing.attributes.state !== LISTING_STATE_DRAFT;
    const panelTitle = isPublished ? (
        <FormattedMessage
            id="EditListingGeneralPanel.name"
            values={{ listingTitle: <ListingLink listing={listing} /> }}
        />
    ) : (
        <FormattedMessage id="EditListingGeneralPanel.createListingTitle" />
    );

    const subjectOptions = findOptionsForSelectFilter('subjects', config.custom.filters);
    const levelOptions = findOptionsForSelectFilter('levels', config.custom.filters);
    const typeOptions = findOptionsForSelectFilter('teachType', config.custom.filters);

    const subjects = publicData && publicData.subjects;
    const levels = publicData && publicData.levels;
    const types = publicData && publicData.types;
    const numberOfHours = publicData && publicData.numberOfHours;

    return (
        <div className={classes}>
            <h1 className={css.title}>{panelTitle}</h1>
            <EditListingGeneralForm
                className={css.form}
                initialValues={{ title, description, subjects, levels, types, numberOfHours }}
                saveActionMsg={submitButtonText}
                onSubmit={values => {
                    const { title, description, subjects = [], levels = [], types, numberOfHours } = values;
                    const updateValues = {
                        title: title.trim(),
                        description,
                        publicData: { subjects, levels, types, numberOfHours }
                    };

                    onSubmit(updateValues);
                }}
                onChange={onChange}
                disabled={disabled}
                ready={ready}
                updated={panelUpdated}
                updateInProgress={updateInProgress}
                fetchErrors={errors}
                subjects={subjectOptions}
                levels={levelOptions}
                types={typeOptions}
            />
        </div>
    );
};

EditListingGeneralPanel.defaultProps = {
    className: null,
    rootClassName: null,
    errors: null,
    listing: null,
};

EditListingGeneralPanel.propTypes = {
    className: string,
    rootClassName: string,

    // We cannot use propTypes.listing since the listing might be a draft.
    listing: object,

    disabled: bool.isRequired,
    ready: bool.isRequired,
    onSubmit: func.isRequired,
    onChange: func.isRequired,
    submitButtonText: string.isRequired,
    panelUpdated: bool.isRequired,
    updateInProgress: bool.isRequired,
    errors: object.isRequired,
};

export default EditListingGeneralPanel;
