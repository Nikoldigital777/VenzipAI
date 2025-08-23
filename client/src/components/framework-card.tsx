interface Framework {
  id: string;
  name: string;
  displayName: string;
  description: string;
  complexity: string;
  estimatedTimeMonths: number;
  totalControls: number;
  icon: string;
  color: string;
}

interface FrameworkCardProps {
  framework: Framework;
  selected: boolean;
  onToggle: () => void;
}

export default function FrameworkCard({ framework, selected, onToggle }: FrameworkCardProps) {
  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'high': return 'bg-danger-coral/20 text-danger-coral';
      case 'medium': return 'bg-venzip-primary/20 text-venzip-primary-dark';
      case 'low': return 'bg-success-green/20 text-success-green';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getTimeEstimate = (months: number) => {
    if (months < 6) return `${months}-${months + 3} months`;
    return `${months}-${months + 6} months`;
  };

  return (
    <div
      className={`framework-card glass-card p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer hover-lift ${
        selected 
          ? 'selected border-venzip-primary shadow-lg bg-gradient-to-br from-venzip-primary/10 to-venzip-accent/5' 
          : 'border-gray-200 hover:border-venzip-primary/30'
      }`}
      onClick={onToggle}
      data-testid={`framework-card-${framework.name}`}
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-venzip-primary to-venzip-primary-dark opacity-10 rounded-bl-full"></div>
      
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-venzip-primary/10 rounded-lg flex items-center justify-center">
            <i className={`${framework.icon} text-venzip-primary text-lg`}></i>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{framework.displayName}</h3>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getComplexityColor(framework.complexity)}`}>
                {framework.complexity.charAt(0).toUpperCase() + framework.complexity.slice(1)}
              </span>
              <span className="text-xs text-gray-500">{getTimeEstimate(framework.estimatedTimeMonths)}</span>
            </div>
          </div>
        </div>
        <div 
          className={`framework-checkbox w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
            selected 
              ? 'bg-venzip-primary border-venzip-primary' 
              : 'border-gray-300 hover:border-venzip-primary/50'
          }`}
          data-testid={`checkbox-${framework.name}`}
        >
          <i className={`fas fa-check text-white text-sm ${selected ? 'block' : 'hidden'}`}></i>
        </div>
      </div>
      
      <p className="text-gray-600 text-sm leading-relaxed mb-3">{framework.description}</p>
      
      <div className="text-xs text-gray-500">
        {framework.totalControls} controls to implement
      </div>
    </div>
  );
}
