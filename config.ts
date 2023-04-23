import z from 'zod'

export const config = {
  logo: '',
  companyName: 'Company Name',
  maintenanceExpenseRatePerMeter: 120,
}

z.number()
  .min(1, {
    message: 'Maintenance expense rate per meter must be greater than 0',
  })
  .parse(config.maintenanceExpenseRatePerMeter)
