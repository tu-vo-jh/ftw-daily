import React from 'react';
import { arrayOf, bool, func, shape, string } from 'prop-types';
import { compose } from 'redux';
import { Form as FinalForm, FormSpy } from 'react-final-form';
import arrayMutators from 'final-form-arrays';
import { intlShape, injectIntl, FormattedMessage } from '../../util/reactIntl';
import classNames from 'classnames';
import { propTypes } from '../../util/types';
import { maxLength, required, composeValidators } from '../../util/validators';
import { Form, Button, FieldTextInput, FieldCheckboxGroup, FieldSelect } from '../../components';

import css from './EditListingGeneralForm.module.css';

const TITLE_MAX_LENGTH = 60;

const EditListingGeneralFormComponent = props => (
    <FinalForm
        {...props}
        mutators={{ ...arrayMutators }}
        render={formRenderProps => {
            const {
                subjects,
                levels,
                types,
                className,
                disabled,
                ready,
                handleSubmit,
                intl,
                invalid,
                pristine,
                saveActionMsg,
                updated,
                updateInProgress,
                fetchErrors
            } = formRenderProps;

            const titleMessage = intl.formatMessage({ id: 'EditListingGeneralForm.title' });
            const titlePlaceholderMessage = intl.formatMessage({
                id: 'EditListingGeneralForm.titlePlaceholder',
            });
            const titleRequiredMessage = intl.formatMessage({
                id: 'EditListingGeneralForm.titleRequired',
            });
            const maxLengthMessage = intl.formatMessage(
                { id: 'EditListingGeneralForm.maxLength' },
                {
                    maxLength: TITLE_MAX_LENGTH,
                }
            );

            const descriptionMessage = intl.formatMessage({
                id: 'EditListingGeneralForm.description',
            });
            const descriptionPlaceholderMessage = intl.formatMessage({
                id: 'EditListingGeneralForm.descriptionPlaceholder',
            });
            const maxLength60Message = maxLength(maxLengthMessage, TITLE_MAX_LENGTH);
            const descriptionRequiredMessage = intl.formatMessage({
                id: 'EditListingGeneralForm.descriptionRequired',
            });

            const numberOfHoursMessage = intl.formatMessage({
                id: 'EditListingGeneralForm.numberOfHours',
            });
            const numberOfHoursPlaceholderMessage = intl.formatMessage({
                id: 'EditListingGeneralForm.numberOfHoursPlaceholder',
            });
            const numberOfHoursRequiredMessage = intl.formatMessage({
                id: 'EditListingGeneralForm.numberOfHoursRequired',
            });

            const { updateListingError, createListingDraftError, showListingsError } = fetchErrors || {};
            const errorMessageUpdateListing = updateListingError ? (
                <p className={css.error}>
                    <FormattedMessage id="EditListingGeneralForm.updateFailed" />
                </p>
            ) : null;

            // This error happens only on first tab (of EditListingWizard)
            const errorMessageCreateListingDraft = createListingDraftError ? (
                <p className={css.error}>
                    <FormattedMessage id="EditListingGeneralForm.createListingDraftError" />
                </p>
            ) : null;

            const errorMessageShowListing = showListingsError ? (
                <p className={css.error}>
                    <FormattedMessage id="EditListingGeneralForm.showListingFailed" />
                </p>
            ) : null;

            const subjectMessage = intl.formatMessage({ id: 'EditListingGeneralForm.subject' });
            const levelMessage = intl.formatMessage({ id: 'EditListingGeneralForm.level' });

            const typeLabel = intl.formatMessage({
                id: 'EditListingGeneralForm.typeLabel',
            });
            const typePlaceholder = intl.formatMessage({
                id: 'EditListingGeneralForm.typePlaceholder',
            });

            const classes = classNames(css.root, className);
            const submitReady = (updated && pristine) || ready;
            const submitInProgress = updateInProgress;
            const submitDisabled = invalid || disabled || submitInProgress;

            return (
                <Form className={classes} onSubmit={handleSubmit}>
                    {errorMessageCreateListingDraft}
                    {errorMessageUpdateListing}
                    {errorMessageShowListing}
                    <FieldTextInput
                        id="title"
                        name="title"
                        className={css.name}
                        type="text"
                        label={titleMessage}
                        placeholder={titlePlaceholderMessage}
                        maxLength={TITLE_MAX_LENGTH}
                        validate={composeValidators(required(titleRequiredMessage), maxLength60Message)}
                        autoFocus
                    />

                    <FieldTextInput
                        id="description"
                        name="description"
                        className={css.description}
                        type="textarea"
                        label={descriptionMessage}
                        placeholder={descriptionPlaceholderMessage}
                        validate={composeValidators(required(descriptionRequiredMessage))}
                    />

                    <label htmlFor="subjects">{subjectMessage}</label>
                    <FieldCheckboxGroup className={css.subjects} id="subjects" name="subjects" options={subjects} />

                    <label htmlFor="levels">{levelMessage}</label>
                    <FieldCheckboxGroup className={css.levels} id="levels" name="levels" options={levels} />

                    <FieldSelect
                        className={css.types}
                        name="types"
                        id="types"
                        label={typeLabel}>
                        <option disabled value="">
                            {typePlaceholder}
                        </option>
                        {types.map(c => (
                            <option key={c.key} value={c.key}>
                                {c.label}
                            </option>
                        ))}
                    </FieldSelect>

                    <FormSpy subscription={{ values: true }}>
                        {({ values }) => {
                            return (
                                <FieldTextInput
                                    id="numberOfHours"
                                    name="numberOfHours"
                                    className={values.types === 'full' ? css.disableNumber : css.number}
                                    type="number"
                                    max="8"
                                    min="1"
                                    defaultValue={values.types === 'full' ? '8' : '1'}
                                    label={numberOfHoursMessage}
                                    placeholder={numberOfHoursPlaceholderMessage}
                                    validate={composeValidators(required(numberOfHoursRequiredMessage))}
                                />
                            )
                        }}
                    </FormSpy>

                    <Button
                        className={css.submitButton}
                        type="submit"
                        inProgress={submitInProgress}
                        disabled={submitDisabled}
                        ready={submitReady}
                    >
                        {saveActionMsg}
                    </Button>
                </Form>
            );
        }}
    />
);

EditListingGeneralFormComponent.defaultProps = { className: null, fetchErrors: null };

EditListingGeneralFormComponent.propTypes = {
    className: string,
    intl: intlShape.isRequired,
    onSubmit: func.isRequired,
    saveActionMsg: string.isRequired,
    disabled: bool.isRequired,
    ready: bool.isRequired,
    updated: bool.isRequired,
    updateInProgress: bool.isRequired,
    fetchErrors: shape({
        createListingDraftError: propTypes.error,
        showListingsError: propTypes.error,
        updateListingError: propTypes.error,
    }),
    subjects: arrayOf(
        shape({
            key: string.isRequired,
            label: string.isRequired,
        })
    ),
    levels: arrayOf(
        shape({
            key: string.isRequired,
            label: string.isRequired,
        })
    ),
    types: arrayOf(
        shape({
            key: string.isRequired,
            label: string.isRequired,
        })
    ),
};

export default compose(injectIntl)(EditListingGeneralFormComponent);
