// @flow
import React, { Component } from 'react';
import { I18n } from 'react-i18next';
import { Form, Input } from 'semantic-ui-react';
import debounce from 'lodash/debounce';
import { Decimal } from 'decimal.js';

export default class WalletPanelFormStakeInput extends Component<Props> {
  componentDidMount = () => {
    const {
      decimalCpuAmount,
      decimalNetAmount
    } = this.props;

    this.setState({
      cpuAmount: decimalCpuAmount,
      netAmount: decimalNetAmount
    });
  }

  onChange = debounce((e, { name, value }) => {
    const {
      onChange,
      onError
    } = this.props;

    this.setState({
      [name]: value,
    });

    const error = this.errorsInForm();

    if (error) {
      onError(error);
    } else {
      onChange(name, value);
    }
  }, 300)

  errorsInForm = () => {
    const {
      cpuOriginal,
      EOSbalance,
      netOriginal,
      onError
    } = this.props;

    const {
      cpuAmount,
      netAmount,
    } = this.state;

    const decimalRegex = /^\d+(\.\d{1,4})?$/;

    if (!decimalRegex.test(cpuAmount) || !decimalRegex.test(netAmount)) {
      return 'not_valid_stake_amount';
    }

    const decimalCpuAmount = Decimal(cpuAmount);
    const decimalNetAmount = Decimal(netAmount);

    if (cpuOriginal.equals(decimalCpuAmount) && netOriginal.equals(decimalNetAmount)) {
      return onError(null);
    }

    if (!decimalCpuAmount.greaterThan(0) || !decimalNetAmount.greaterThan(0)) {
      return 'no_stake_left';
    }

    const cpuChange = (decimalCpuAmount - cpuOriginal);
    const netChange = (decimalNetAmount - netOriginal);

    if (Math.max(0, cpuChange) + Math.max(0, netChange) > EOSbalance) {
      return 'not_enough_balance';
    }

    return false;
  }

  render() {
    const {
      defaultValue,
      label,
      name
    } = this.props;

    return (
      <Form.Field
        autoFocus
        control={Input}
        fluid
        label={label}
        name={name}
        onChange={this.onChange}
        defaultValue={defaultValue.toFixed(4)}
      />
    );
  }
}