import { FlightPageTemplate } from '@/components/flight-page-template';
import { flightData } from '@/lib/data/flight-data';

export default function MaintenanceFlightPage() {
  const data = flightData.maintenance;
  return <FlightPageTemplate flightType="Maintenance Flight" flightInfo={data.flightInfo} initialFiles={data.initialFiles} />;
}
