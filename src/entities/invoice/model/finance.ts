import { InvoiceStatus, type Invoice, type InvoiceTotals } from "./types";

function normalizeDate(date: Date) {
	const normalizedDate = new Date(date);
	normalizedDate.setHours(0, 0, 0, 0);

	return normalizedDate;
}

export function isInvoiceOverdue(invoice: Pick<Invoice, "dueDate" | "status">, referenceDate = new Date()) {
	if (invoice.status === InvoiceStatus.PAID || invoice.status === InvoiceStatus.CANCELLED) {
		return false;
	}

	const dueDate = new Date(invoice.dueDate);
	if (!Number.isFinite(dueDate.getTime())) {
		return false;
	}

	return normalizeDate(dueDate) < normalizeDate(referenceDate);
}

export function calculateInvoiceTotals(invoices: Invoice[]): InvoiceTotals {
	const currencies = new Set(invoices.map((invoice) => invoice.currency || "USD"));
	const currency = invoices[0]?.currency || "USD";

	return invoices.reduce<InvoiceTotals>(
		(totals, invoice) => {
			const amount = Number(invoice.amount) || 0;
			const isPaid = invoice.status === InvoiceStatus.PAID;
			const isCancelled = invoice.status === InvoiceStatus.CANCELLED;
			const isOverdue = invoice.status === InvoiceStatus.OVERDUE || isInvoiceOverdue(invoice);

			totals.totalAmount += isCancelled ? 0 : amount;
			totals.paidAmount += isPaid ? amount : 0;
			totals.outstandingAmount += !isPaid && !isCancelled ? amount : 0;
			totals.overdueAmount += isOverdue ? amount : 0;
			totals.invoiceCount += 1;
			totals.paidCount += isPaid ? 1 : 0;
			totals.overdueCount += isOverdue ? 1 : 0;

			return totals;
		},
		{
			totalAmount: 0,
			paidAmount: 0,
			outstandingAmount: 0,
			overdueAmount: 0,
			invoiceCount: 0,
			paidCount: 0,
			overdueCount: 0,
			currency,
			hasMixedCurrencies: currencies.size > 1,
		}
	);
}
