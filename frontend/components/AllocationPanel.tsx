import React, { useId, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, CircleDollarSign, CreditCard, Layers, PieChart } from 'lucide-react';
import { Account, AssetType, Category, Currency, Language, MonthlySummary, Owner } from '../types';
import { t } from '../utils/translations';
import { buildAllocation } from '../utils/allocation';

interface AllocationPanelProps {
  records: MonthlySummary[];
  accounts: Account[];
  categories: Category[];
  owners: Owner[];
  currency: Currency;
  language: Language;
}

const PREVIEW_COUNT = 8;
const buttonClass = 'flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold transition hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500';

export const AllocationPanel = ({ records, accounts, categories, owners, currency, language }: AllocationPanelProps) => {
  const [type, setType] = useState<AssetType>('ASSET');
  const [groupBy, setGroupBy] = useState<'category' | 'account'>('category');
  const [expanded, setExpanded] = useState(false);
  const listId = useId();
  const titleId = useId();
  const items = useMemo(() => buildAllocation(records, accounts, categories, currency, type, groupBy),
    [records, accounts, categories, currency, type, groupBy]);
  const total = items.reduce((sum, item) => sum + item.value, 0);
  const visibleItems = expanded ? items : items.slice(0, PREVIEW_COUNT);
  const locale = language === Language.FR ? 'fr-FR' : language === Language.ZH ? 'zh-CN' : 'en-US';
  const money = new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 0 });
  const percent = new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 1 });
  const formatShare = (value: number) => value / total < 0.001 ? `<${percent.format(0.001)}` : percent.format(value / total);

  return (
    <section aria-labelledby={titleId} className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
      <div className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center sm:px-6">
        <div>
          <h3 id={titleId} className="text-lg font-bold text-slate-800">{t(type === 'ASSET' ? 'dash.allocation' : 'dash.liabilitiesDist', language)}</h3>
          <p className="mt-1 text-xs text-slate-500">{t('dash.allocationHint', language)}</p>
        </div>
        <div role="group" aria-label={t('form.type', language)} className="flex self-start rounded-lg bg-slate-100 p-1">
          {(['ASSET', 'LIABILITY'] as const).map(value => {
            const Icon = value === 'ASSET' ? CircleDollarSign : CreditCard;
            return <button key={value} type="button" aria-pressed={type === value} onClick={() => { setType(value); setExpanded(false); }}
              className={`${buttonClass} ${type === value ? `bg-white shadow-sm ${value === 'ASSET' ? 'text-emerald-700' : 'text-rose-700'}` : 'text-slate-500'}`}>
              <Icon size={15} aria-hidden="true" />{t(value === 'ASSET' ? 'type.asset' : 'type.liability', language)}
            </button>;
          })}
        </div>
      </div>

      <div className="mx-5 flex flex-wrap items-end justify-between gap-4 border-b border-slate-100 pb-5 sm:mx-6">
        <div>
          <div className="mb-1 text-xs text-slate-500">{t('dash.allocationTotal', language)} · {currency}</div>
          <div className="text-2xl font-semibold tracking-tight text-slate-900 tabular-nums">{money.format(total)}</div>
          <p className="mt-1 text-xs text-slate-500">{t(groupBy === 'account' ? 'dash.accountCount' : 'dash.categoryCount', language, [items.length])}</p>
        </div>
        <div role="group" aria-label={t('dash.groupBy', language)} className="flex rounded-lg bg-slate-50 p-1 ring-1 ring-inset ring-slate-100">
          {(['category', 'account'] as const).map(value => {
            const Icon = value === 'category' ? PieChart : Layers;
            return <button key={value} type="button" aria-pressed={groupBy === value} onClick={() => { setGroupBy(value); setExpanded(false); }}
              className={`${buttonClass} ${groupBy === value ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}>
              <Icon size={14} aria-hidden="true" />{t(value === 'category' ? 'dash.byCategory' : 'dash.byAccount', language)}
            </button>;
          })}
        </div>
      </div>

      {items.length === 0 ? (
        <div role="status" className="flex flex-col items-center gap-3 px-5 py-14 text-sm text-slate-500">
          {type === 'ASSET' ? <CircleDollarSign size={28} className="text-slate-300" /> : <CreditCard size={28} className="text-slate-300" />}
          {t(type === 'ASSET' ? 'dash.noActiveAssets' : 'dash.noActiveLiabilities', language)}
        </div>
      ) : (
        <div className="px-5 pb-2 sm:px-6">
          <div aria-hidden="true" className="allocation-row allocation-heading text-xs text-slate-500">
            <span>{t(groupBy === 'account' ? 'entry.account' : 'entry.category', language)}</span>
            <span className="hidden md:block">{t('dash.proportion', language)}</span>
            <span className="text-right">{t('entry.amount', language)} <span className="md:hidden">/ {t('dash.share', language)}</span></span>
            <span className="hidden text-right md:block">{t('dash.share', language)}</span>
          </div>
          <ol id={listId} className="divide-y divide-slate-100">
            {visibleItems.map((item, index) => {
              const owner = owners.find(o => o.id === item.ownerId)?.name;
              const detail = groupBy === 'account' ? [owner, item.category?.name].filter(Boolean).join(' · ') : undefined;
              return (
                <li key={item.id} className="allocation-row py-3.5">
                  <div className="flex min-w-0 items-start gap-3">
                    <span aria-hidden="true" className="w-4 shrink-0 pt-0.5 text-xs text-slate-400 tabular-nums">{String(index + 1).padStart(2, '0')}</span>
                    <div className="min-w-0">
                      <div className="text-sm font-medium leading-5 text-slate-800 [overflow-wrap:anywhere]">{item.name || t('history.uncategorized', language)}</div>
                      {detail && <div className="mt-1 text-xs leading-4 text-slate-500 [overflow-wrap:anywhere]">{detail}</div>}
                    </div>
                  </div>
                  <div aria-hidden="true" className="allocation-bar h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full" style={{ width: `${item.value / total * 100}%`, minWidth: '2px', backgroundColor: groupBy === 'category' ? (item.category?.color ?? '#64748b') : type === 'ASSET' ? '#3b82f6' : '#e11d48' }} />
                  </div>
                  <div className="text-right text-sm font-semibold text-slate-800 tabular-nums">
                    {money.format(item.value)}
                    <span className="mt-1 block text-xs font-normal text-slate-500 md:hidden"><span className="sr-only">{t('dash.share', language)} </span>{formatShare(item.value)}</span>
                  </div>
                  <div className="hidden text-right text-xs text-slate-500 tabular-nums md:block"><span className="sr-only">{t('dash.share', language)} </span>{formatShare(item.value)}</div>
                </li>
              );
            })}
          </ol>
          {items.length > PREVIEW_COUNT && (
            <button type="button" aria-expanded={expanded} aria-controls={listId} onClick={() => setExpanded(!expanded)}
              className="my-1 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg text-sm font-medium text-blue-600 transition hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-blue-500">
              {t(expanded ? 'dash.showLess' : 'dash.showAll', language, [items.length])}
              {expanded ? <ChevronUp size={16} aria-hidden="true" /> : <ChevronDown size={16} aria-hidden="true" />}
            </button>
          )}
        </div>
      )}
    </section>
  );
};
