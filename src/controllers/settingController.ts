import { Request, Response } from 'express';
import Setting from '../models/Setting';

export const getSettings = async (req: Request, res: Response) => {
  try {
    const settings = await Setting.findOne();
    if (!settings) return res.json({});
    
    res.json({
      id: settings.id,
      company_name: settings.companyName || "",
      domain: settings.domain || "",
      email: settings.email || "",
      bank_name: settings.bankName || "",
      account_name: settings.accountName || "",
      account_number: settings.accountNumber || "",
      phone_number: settings.phoneNumber || "",
      address: settings.address || "",
      logo: settings.logo || "",
      favicon: settings.favicon || "",
      currency_symbol: settings.currencySymbol || "₦",
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateSettings = async (req: Request, res: Response) => {
  try {
    let settings = await Setting.findOne();
    
    const updateData: any = {};
    if (req.body.company_name !== undefined) updateData.companyName = req.body.company_name;
    if (req.body.domain !== undefined) updateData.domain = req.body.domain;
    if (req.body.email !== undefined) updateData.email = req.body.email;
    if (req.body.bank_name !== undefined) updateData.bankName = req.body.bank_name;
    if (req.body.account_name !== undefined) updateData.accountName = req.body.account_name;
    if (req.body.account_number !== undefined) updateData.accountNumber = req.body.account_number;
    if (req.body.phone_number !== undefined) updateData.phoneNumber = req.body.phone_number;
    if (req.body.address !== undefined) updateData.address = req.body.address;
    if (req.body.currency_symbol !== undefined) updateData.currencySymbol = req.body.currency_symbol;

    if (!settings) {
      settings = new Setting(updateData);
    } else {
      settings.set(updateData);
    }

    if (req.files) {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      if (files['logo']) {
        settings.logo = (files['logo'][0] as any).location || `/uploads/${files['logo'][0].filename}`;
      }
      if (files['favicon']) {
        settings.favicon = (files['favicon'][0] as any).location || `/uploads/${files['favicon'][0].filename}`;
      }
    }

    await settings.save();
    
    res.json({
      id: settings.id,
      company_name: settings.companyName || "",
      domain: settings.domain || "",
      email: settings.email || "",
      bank_name: settings.bankName || "",
      account_name: settings.accountName || "",
      account_number: settings.accountNumber || "",
      phone_number: settings.phoneNumber || "",
      address: settings.address || "",
      logo: settings.logo || "",
      favicon: settings.favicon || "",
      currency_symbol: settings.currencySymbol || "₦",
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
