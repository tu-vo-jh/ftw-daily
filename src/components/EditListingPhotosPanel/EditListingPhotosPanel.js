import React, { Component } from 'react';
import { array, bool, func, object, string } from 'prop-types';
import { FormattedMessage } from '../../util/reactIntl';
import classNames from 'classnames';
import { LISTING_STATE_DRAFT, MAIN_PHOTO_TYPE, OTHER_PHOTO_TYPE } from '../../util/types';
import { EditListingPhotosForm } from '../../forms';
import { ensureOwnListing } from '../../util/data';
import { ListingLink } from '../../components';

import css from './EditListingPhotosPanel.module.css';

class EditListingPhotosPanel extends Component {
  render() {
    const {
      className,
      rootClassName,
      errors,
      disabled,
      ready,
      images,
      listing,
      onImageUpload,
      onUpdateImageOrder,
      submitButtonText,
      panelUpdated,
      updateInProgress,
      onChange,
      onSubmit,
      onRemoveImage,
      title,
      subTitle
    } = this.props;

    const rootClass = rootClassName || css.root;
    const classes = classNames(rootClass, className);
    const currentListing = ensureOwnListing(listing);
    const { publicData } = currentListing.attributes;
    const { mainPhotos = [], otherPhotos = [] } = publicData;

    const isPublished =
      currentListing.id && currentListing.attributes.state !== LISTING_STATE_DRAFT;
    const panelTitle = isPublished ? (
      <FormattedMessage
        id="EditListingPhotosPanel.title"
        values={{ listingTitle: <ListingLink listing={listing} /> }}
      />
    ) : (
      <FormattedMessage id={title} />
    );

    const isMainImg = (img) => {
      return img.id.split('_')[0] === MAIN_PHOTO_TYPE;
    }

    return (
      <div className={classes}>
        <div className={css.section}>
          <h1 className={css.title}>{panelTitle}</h1>
          <EditListingPhotosForm
            className={css.form}
            disabled={disabled}
            ready={ready}
            fetchErrors={errors}
            initialValues={{ images }}
            images={images}
            onImageUpload={onImageUpload}
            onSubmit={values => {
              const { addImage, ...updateValue } = values;

              updateValue.images.forEach(img => {
                if (img.imageId) {
                  if (isMainImg(img)) {
                    mainPhotos.push(img.imageId.uuid);
                  } else {
                    otherPhotos.push(img.imageId.uuid);
                  }
                }
              });

              onSubmit({
                ...updateValue,
                publicData: {
                  mainPhotos,
                  otherPhotos
                }
              });
            }}
            onChange={onChange}
            onUpdateImageOrder={onUpdateImageOrder}
            onRemoveImage={onRemoveImage}
            saveActionMsg={submitButtonText}
            updated={panelUpdated}
            updateInProgress={updateInProgress}
            mainPhotos={mainPhotos}
            otherPhotos={otherPhotos}
            subTitle={subTitle}
          />
        </div>
      </div>
    );
  }
}

EditListingPhotosPanel.defaultProps = {
  className: null,
  rootClassName: null,
  errors: null,
  images: [],
  listing: null,
};

EditListingPhotosPanel.propTypes = {
  className: string,
  rootClassName: string,
  errors: object,
  disabled: bool.isRequired,
  ready: bool.isRequired,
  images: array,

  // We cannot use propTypes.listing since the listing might be a draft.
  listing: object,

  onImageUpload: func.isRequired,
  onUpdateImageOrder: func.isRequired,
  onSubmit: func.isRequired,
  onChange: func.isRequired,
  submitButtonText: string.isRequired,
  panelUpdated: bool.isRequired,
  updateInProgress: bool.isRequired,
  onRemoveImage: func.isRequired,
};

export default EditListingPhotosPanel;
