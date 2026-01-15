interface BMISpeedometerProps {
  bmi: number;
  size?: number;
}

export function BMISpeedometer({ bmi, size = 120 }: BMISpeedometerProps) {
  // BMI categories and ranges
  // Underweight: < 18.5
  // Normal: 18.5 - 24.9
  // Overweight: 25 - 29.9
  // Obese: >= 30

  const getBMICategory = (value: number) => {
    if (value < 18.5) return { label: 'Kurus', color: '#3B82F6' };
    if (value < 25) return { label: 'Normal', color: '#22C55E' };
    if (value < 30) return { label: 'Gemuk', color: '#F59E0B' };
    return { label: 'Obesitas', color: '#EF4444' };
  };

  const category = getBMICategory(bmi);

  // Calculate needle angle based on BMI
  // Range: 10 (min) to 40 (max), mapped to -90 to 90 degrees
  const minBMI = 10;
  const maxBMI = 40;
  const clampedBMI = Math.max(minBMI, Math.min(maxBMI, bmi));
  const normalizedValue = (clampedBMI - minBMI) / (maxBMI - minBMI);
  const angle = -90 + normalizedValue * 180;

  const centerX = size / 2;
  const centerY = size * 0.6;
  const radius = size * 0.4;

  // Create arc segments for the speedometer
  const createArc = (startAngle: number, endAngle: number, color: string) => {
    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);
    
    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);
    
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    
    return (
      <path
        key={`${startAngle}-${endAngle}`}
        d={`M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`}
        stroke={color}
        strokeWidth={size * 0.08}
        fill="none"
        strokeLinecap="round"
      />
    );
  };

  // Needle
  const needleLength = radius * 0.75;
  const needleAngle = (angle - 90) * (Math.PI / 180);
  const needleX = centerX + needleLength * Math.cos(needleAngle);
  const needleY = centerY + needleLength * Math.sin(needleAngle);

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size * 0.7} viewBox={`0 0 ${size} ${size * 0.7}`}>
        {/* Background arc segments */}
        {createArc(-90, -45, '#3B82F6')}  {/* Underweight */}
        {createArc(-45, 35, '#22C55E')}   {/* Normal */}
        {createArc(35, 65, '#F59E0B')}    {/* Overweight */}
        {createArc(65, 90, '#EF4444')}    {/* Obese */}
        
        {/* Needle */}
        <line
          x1={centerX}
          y1={centerY}
          x2={needleX}
          y2={needleY}
          stroke="#374151"
          strokeWidth={2}
          strokeLinecap="round"
        />
        
        {/* Center dot */}
        <circle cx={centerX} cy={centerY} r={size * 0.04} fill="#374151" />
        
        {/* Labels */}
        <text x={size * 0.08} y={centerY + 3} fontSize={size * 0.08} fill="#6B7280" textAnchor="start">10</text>
        <text x={size * 0.92} y={centerY + 3} fontSize={size * 0.08} fill="#6B7280" textAnchor="end">40</text>
      </svg>
      
      {/* BMI Value and Category */}
      <div className="text-center -mt-2">
        <span 
          className="text-xl font-bold"
          style={{ color: category.color }}
        >
          {bmi.toFixed(1)}
        </span>
        <span className="text-xs text-gray-500 ml-1">kg/m²</span>
        <p 
          className="text-xs font-medium mt-0.5"
          style={{ color: category.color }}
        >
          {category.label}
        </p>
      </div>
    </div>
  );
}

export function calculateBMI(weight: number, height: number): number {
  // height in cm, convert to meters
  const heightInMeters = height / 100;
  return weight / (heightInMeters * heightInMeters);
}
