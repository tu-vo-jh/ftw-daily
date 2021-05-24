import React from 'react';
import PropTypes from 'prop-types';
import { intlShape } from '../../util/reactIntl';
import routeConfiguration from '../../routeConfiguration';
import {
    LISTING_PAGE_PARAM_TYPE_DRAFT,
    LISTING_PAGE_PARAM_TYPE_NEW,
    LISTING_PAGE_PARAM_TYPES,
} from '../../util/urlHelpers';
import { ensureListing } from '../../util/data';
import { createResourceLocatorString } from '../../util/routes';
import {
    EditListingAvailabilityPanel,
    EditListingGeneralPanel,
    EditListingLocationPanel,
    EditListingPhotosPanel,
    EditListingPricingPanel,
} from '../../components';

import config from '../../config';

import css from './EditTeacherListingWizard.module.css';
import { LINE_ITEM_HOUR } from '../../util/types';

export const AVAILABILITY = 'availability';
export const GENERAL = 'general';
export const LOCATION = 'location';
export const PRICING = 'pricing';
export const PHOTOS = 'photos';

// EditTeacherListingWizardTab component supports these tabs
export const SUPPORTED_TABS = [
    GENERAL,
    LOCATION,
    PRICING,
    AVAILABILITY,
    PHOTOS
];

const pathParamsToNextTab = (params, tab, marketplaceTabs) => {
    const nextTabIndex = marketplaceTabs.findIndex(s => s === tab) + 1;
    const nextTab =
        nextTabIndex < marketplaceTabs.length
            ? marketplaceTabs[nextTabIndex]
            : marketplaceTabs[marketplaceTabs.length - 1];
    return { ...params, tab: nextTab };
};

// When user has update draft listing, he should be redirected to next EditTeacherListingWizardTab
const redirectAfterDraftUpdate = (listingId, params, tab, marketplaceTabs, history) => {
    const currentPathParams = {
        ...params,
        type: LISTING_PAGE_PARAM_TYPE_DRAFT,
        id: listingId,
    };
    const routes = routeConfiguration();

    // Replace current "new" path to "draft" path.
    // Browser's back button should lead to editing current draft instead of creating a new one.
    if (params.type === LISTING_PAGE_PARAM_TYPE_NEW) {
        const draftURI = createResourceLocatorString('EditTeacherListingPage', routes, currentPathParams, {});
        history.replace(draftURI);
    }

    // Redirect to next tab
    const nextPathParams = pathParamsToNextTab(currentPathParams, tab, marketplaceTabs);
    const to = createResourceLocatorString('EditTeacherListingPage', routes, nextPathParams, {});
    history.push(to);
};

const EditTeacherListingWizardTab = props => {
    const {
        tab,
        marketplaceTabs,
        params,
        errors,
        fetchInProgress,
        newListingPublished,
        history,
        images,
        availability,
        listing,
        handleCreateFlowTabScrolling,
        handlePublishListing,
        onUpdateListing,
        onCreateListingDraft,
        onImageUpload,
        onUpdateImageOrder,
        onRemoveImage,
        onChange,
        updatedTab,
        updateInProgress,
        intl,
    } = props;

    const { type } = params;
    const isNewURI = type === LISTING_PAGE_PARAM_TYPE_NEW;
    const isDraftURI = type === LISTING_PAGE_PARAM_TYPE_DRAFT;
    const isNewListingFlow = isNewURI || isDraftURI;

    const currentListing = ensureListing(listing);
    const imageIds = images => {
        return images ? images.map(img => img.imageId || img.id) : null;
    };

    const onCompleteEditTeacherListingWizardTab = (tab, updateValues) => {
        // Normalize images for API call
        const { images: updatedImages, ...otherValues } = updateValues;
        const imageProperty =
            typeof updatedImages !== 'undefined' ? { images: imageIds(updatedImages) } : {};

        const updateValuesWithImages = { ...otherValues, ...imageProperty };

        if (isNewListingFlow) {
            const onUpsertListingDraft = isNewURI
                ? (tab, updateValues) => onCreateListingDraft(updateValues)
                : onUpdateListing;

            const upsertValues = isNewURI
                ? updateValuesWithImages
                : { ...updateValuesWithImages, id: currentListing.id };

            onUpsertListingDraft(tab, upsertValues)
                .then(r => {
                    if (tab !== marketplaceTabs[marketplaceTabs.length - 1]) {
                        // Create listing flow: smooth scrolling polyfill to scroll to correct tab
                        handleCreateFlowTabScrolling(false);

                        // After successful saving of draft data, user should be redirected to next tab
                        redirectAfterDraftUpdate(r.data.data.id.uuid, params, tab, marketplaceTabs, history);
                    } else {
                        handlePublishListing(currentListing.id);
                    }
                })
                .catch(e => {
                    // No need for extra actions
                });
        } else {
            onUpdateListing(tab, { ...updateValuesWithImages, id: currentListing.id });
        }
    };

    const panelProps = tab => {
        return {
            className: css.panel,
            errors,
            listing,
            onChange,
            panelUpdated: updatedTab === tab,
            updateInProgress,
            // newListingPublished and fetchInProgress are flags for the last wizard tab
            ready: newListingPublished,
            disabled: fetchInProgress,
        };
    };

    switch (tab) {
        case GENERAL: {
            const submitButtonTranslationKey = isNewListingFlow
                ? 'EditListingWizard.saveNewGeneral'
                : 'EditListingWizard.saveEditGeneral';
            return (
                <EditListingGeneralPanel
                    {...panelProps(GENERAL)}
                    submitButtonText={intl.formatMessage({ id: submitButtonTranslationKey })}
                    onSubmit={values => {
                        onCompleteEditTeacherListingWizardTab(tab, values);
                    }}
                />
            );
        }
        case LOCATION: {
            const submitButtonTranslationKey = isNewListingFlow
                ? 'EditListingWizard.saveNewLocation'
                : 'EditListingWizard.saveEditLocation';
            return (
                <EditListingLocationPanel
                    {...panelProps(LOCATION)}
                    submitButtonText={intl.formatMessage({ id: submitButtonTranslationKey })}
                    onSubmit={values => {
                        onCompleteEditTeacherListingWizardTab(tab, values);
                    }}
                />
            );
        }
        case PRICING: {
            const submitButtonTranslationKey = isNewListingFlow
                ? 'EditListingWizard.saveNewPricing'
                : 'EditListingWizard.saveEditPricing';
            config.bookingUnitType = LINE_ITEM_HOUR;
            return (
                <EditListingPricingPanel
                    {...panelProps(PRICING)}
                    submitButtonText={intl.formatMessage({ id: submitButtonTranslationKey })}
                    onSubmit={values => {
                        onCompleteEditTeacherListingWizardTab(tab, values);
                    }}
                />
            );
        }
        case AVAILABILITY: {
            const submitButtonTranslationKey = isNewListingFlow
                ? 'EditListingWizard.saveNewAvailability'
                : 'EditListingWizard.saveEditAvailability';
            const defaultSeat = 0;
            return (
                <EditListingAvailabilityPanel
                    {...panelProps(AVAILABILITY)}
                    availability={availability}
                    defaultSeat={defaultSeat}
                    submitButtonText={intl.formatMessage({ id: submitButtonTranslationKey })}
                    onSubmit={values => {
                        onCompleteEditTeacherListingWizardTab(tab, values);
                    }}
                />
            );
        }
        case PHOTOS: {
            const submitButtonTranslationKey = isNewListingFlow
                ? 'EditListingWizard.saveNewPhotos'
                : 'EditListingWizard.saveEditPhotos';
            const titleListingPanelKey = 'EditTeacherListingPhotosPanel.mainPhoto';
            const subTitleListingPanelKey = 'EditTeacherListingPhotosPanel.otherPhotos';
            return (
                <EditListingPhotosPanel
                    {...panelProps(PHOTOS)}
                    submitButtonText={intl.formatMessage({ id: submitButtonTranslationKey })}
                    images={images}
                    onImageUpload={onImageUpload}
                    onRemoveImage={onRemoveImage}
                    onSubmit={values => {
                        onCompleteEditTeacherListingWizardTab(tab, values);
                    }}
                    onUpdateImageOrder={onUpdateImageOrder}
                    title={titleListingPanelKey}
                    subTitle={subTitleListingPanelKey}
                />
            );
        }
        default:
            return null;
    }
};

EditTeacherListingWizardTab.defaultProps = {
    listing: null,
    updatedTab: null,
};

const { array, bool, func, object, oneOf, shape, string } = PropTypes;

EditTeacherListingWizardTab.propTypes = {
    params: shape({
        id: string.isRequired,
        slug: string.isRequired,
        type: oneOf(LISTING_PAGE_PARAM_TYPES).isRequired,
        tab: oneOf(SUPPORTED_TABS).isRequired,
    }).isRequired,
    errors: shape({
        createListingDraftError: object,
        publishListingError: object,
        updateListingError: object,
        showListingsError: object,
        uploadImageError: object,
    }).isRequired,
    fetchInProgress: bool.isRequired,
    newListingPublished: bool.isRequired,
    history: shape({
        push: func.isRequired,
        replace: func.isRequired,
    }).isRequired,
    images: array.isRequired,
    availability: object.isRequired,

    // We cannot use propTypes.listing since the listing might be a draft.
    listing: shape({
        attributes: shape({
            publicData: object,
            description: string,
            geolocation: object,
            pricing: object,
            title: string,
        }),
        images: array,
    }),

    handleCreateFlowTabScrolling: func.isRequired,
    handlePublishListing: func.isRequired,
    onUpdateListing: func.isRequired,
    onCreateListingDraft: func.isRequired,
    onImageUpload: func.isRequired,
    onUpdateImageOrder: func.isRequired,
    onRemoveImage: func.isRequired,
    onChange: func.isRequired,
    updatedTab: string,
    updateInProgress: bool.isRequired,

    intl: intlShape.isRequired,
};

export default EditTeacherListingWizardTab;
