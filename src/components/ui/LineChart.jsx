import React from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { formatCurrency } from '../../utils/formulas';

const LineChart = ({ 
  data = [], 
  className = '',
  height = 300,
  showLegend = true,
  lines = [
    { key: 'value', color: '#3B82F6', name: 'Valor Proyectado' },
    { key: 'target', color: '#EF4444', name: 'Objetivo' },
  ]
}) => {
  const formatTooltipValue = (value, name) => {
    return [formatCurrency(value), name];
  };

  const formatXAxisLabel = (tickItem) => {
    // Assuming tickItem is month number, convert to readable format
    if (typeof tickItem === 'number') {
      const years = Math.floor(tickItem / 12);
      const months = tickItem % 12;
      
      if (years === 0) {
        return `${months}m`;
      } else if (months === 0) {
        return `${years}a`;
      } else {
        return `${years}a ${months}m`;
      }
    }
    return tickItem;
  };

  const formatYAxisLabel = (tickItem) => {
    return formatCurrency(tickItem).replace('€', '').replace(',', '.');
  };

  if (!data || data.length === 0) {
    return (
      <div className={`flex items-center justify-center bg-gray-50 rounded-lg ${className}`} style={{ height }}>
        <p className="text-gray-500">No hay datos para mostrar</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsLineChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="month"
            tickFormatter={formatXAxisLabel}
            stroke="#6b7280"
            fontSize={12}
          />
          <YAxis 
            tickFormatter={formatYAxisLabel}
            stroke="#6b7280"
            fontSize={12}
          />
          <Tooltip 
            formatter={formatTooltipValue}
            labelFormatter={(label) => `Mes ${label}`}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
          />
          {showLegend && <Legend />}
          
          {lines.map((line) => (
            <Line
              key={line.key}
              type="monotone"
              dataKey={line.key}
              stroke={line.color}
              strokeWidth={2}
              dot={{ fill: line.color, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: line.color, strokeWidth: 2 }}
              name={line.name}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChart;