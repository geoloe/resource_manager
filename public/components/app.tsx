import React, { useEffect, useState } from 'react';
import {
  EuiTabbedContent,
  EuiFlexGroup,
  EuiFlexItem,
  EuiLoadingSpinner,
  EuiText,
  EuiSpacer,
  EuiStat,
  EuiFlexGrid,
  EuiButton,
  EuiSelect,
  EuiHealth
} from '@elastic/eui';
import '@elastic/eui/dist/eui_theme_light.css'; // Import EUI styles

interface NodeStats {
  nodeName: string;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
}

interface NodeStats {
  nodeName: string;
  cpuUsage: number;
  load1m: number;
  load5m: number;
  load15m: number;
  memoryUsage: number;
  memoryFree: number;
  diskUsage: number;
  network: {
    inbound: number;
    outbound: number;
  };
}

interface AllocationStats {
  totalShards: number;
  unassignedShards: number;
  nodeAllocations: {
    nodeName: string;
    shardCount: number;
    diskIndices: string;
    diskUsed: string;
    diskAvail: string;
    diskTotal: string;
    diskPercent: string;
    host: string;
    ip: string;
  }[];
}

interface CatNodeStats {
  nodeName: string;
  ip: string;
  cpuUsage: string;
  heapUsage: string;
  load1m: string;
  load5m: string;
  load15m: string;
  roles: string;
}

interface ClusterHealth {
  clusterName: string;
  status: string;
  numberOfNodes: number;
  numberOfDataNodes: number;
  activeShards: number;
  unassignedShards: number;
  discoveredMaster: boolean;
  discoveredClusterManager: boolean;
  taskMaxWaitingInQueueMillis: number;
  activeShardsPercent: number;
  jdkVersion: string;
  nodeVersion: string;
}

interface ClusterResourceMonitorProps {
  coreStart: any; // CoreStart object, passed from plugin lifecycle
}

const ClusterResourceMonitor: React.FC<ClusterResourceMonitorProps> = ({ coreStart }) => {
  const [nodeStats, setNodeStats] = useState<NodeStats[]>([]);
  const [allocationStats, setAllocationStats] = useState<AllocationStats | null>(null);
  const [catNodesStats, setCatNodesStats] = useState<CatNodeStats[]>([]);
  const [clusterHealth, setClusterHealth] = useState<ClusterHealth | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fetching, setFetching] = useState<boolean>(false);
  const [intervalRate, setIntervalRate] = useState<number>(5000); // Interval for fetching
  const [selectedTab, setSelectedTab] = useState<string>('node-stats-tab'); // Track the selected tab
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const nodeStatsResponse = await coreStart.http.get('/api/cluster_resource_monitor/nodes_stats');
      setNodeStats(nodeStatsResponse);

      const allocationStatsResponse = await coreStart.http.get('/api/cluster_resource_monitor/allocation_stats');
      setAllocationStats(allocationStatsResponse);

      const catNodesResponse = await coreStart.http.get('/api/cluster_resource_monitor/cat_nodes');
      setCatNodesStats(catNodesResponse);

      const clusterHealthResponse = await coreStart.http.get('/api/cluster_resource_monitor/cluster_health');
      setClusterHealth(clusterHealthResponse);
    } catch (error) {
      console.error('Failed to fetch cluster data:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // Trigger fetch on initial load and every interval if fetching is true
  useEffect(() => {
    if (fetching) {
      fetchData();

      const interval = setInterval(() => {
        fetchData();
      }, intervalRate);

      return () => clearInterval(interval);
    }
  }, [fetching, intervalRate]);

  // Update current time every second
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => clearInterval(intervalId); // Cleanup on component unmount
  }, []);

  const toggleFetching = () => {
    setFetching(prev => !prev); // Start/stop fetching
  };

  const tabs = [
    {
      id: 'node-stats-tab',
      name: 'Node Stats',
      content: (
        <>
          <EuiSpacer size="m" />
          <EuiFlexGrid columns={3}>
            <EuiFlexItem>
              <EuiStat
                title={`${(nodeStats.reduce((sum, node) => sum + node.cpuUsage, 0) / nodeStats.length).toFixed(2)}%`}
                description="Avg. CPU Usage"
                titleColor="primary"
              />
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiStat
                title={`${(nodeStats.reduce((sum, node) => sum + node.memoryUsage, 0) / nodeStats.length).toFixed(2)}%`}
                description="Avg. Memory Usage"
                titleColor="success"
              />
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiStat
                title={`${(nodeStats.reduce((sum, node) => sum + node.diskUsage, 0) / nodeStats.length).toFixed(2)} GB`}
                description="Avg. Disk Usage"
                titleColor="danger"
              />
            </EuiFlexItem>
          </EuiFlexGrid>
    
          <EuiSpacer size="m" />
          <EuiFlexGrid columns={3}>
            <EuiFlexItem>
              <EuiStat
                title={`${(nodeStats.reduce((sum, node) => sum + node.load1m, 0) / nodeStats.length).toFixed(2)}`}
                description="Avg. Load 1m"
                titleColor="warning"
              />
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiStat
                title={`${(nodeStats.reduce((sum, node) => sum + node.load5m, 0) / nodeStats.length).toFixed(2)}`}
                description="Avg. Load 5m"
                titleColor="warning"
              />
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiStat
                title={`${(nodeStats.reduce((sum, node) => sum + node.load15m, 0) / nodeStats.length).toFixed(2)}`}
                description="Avg. Load 15m"
                titleColor="warning"
              />
            </EuiFlexItem>
          </EuiFlexGrid>
    
          <EuiSpacer size="m" />
          <EuiFlexGrid columns={3}>
            <EuiFlexItem>
              <EuiStat
                title={`${(nodeStats.reduce((sum, node) => sum + node.network.inbound, 0) / nodeStats.length).toFixed(2)} MB`}
                description="Avg. Inbound Network"
                titleColor="subdued"
              />
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiStat
                title={`${(nodeStats.reduce((sum, node) => sum + node.network.outbound, 0) / nodeStats.length).toFixed(2)} MB`}
                description="Avg. Outbound Network"
                titleColor="subdued"
              />
            </EuiFlexItem>
          </EuiFlexGrid>
        </>
      ),
    },
    {
      id: 'allocation-stats-tab',
      name: 'Allocation Stats',
      content: (
        <>
          <EuiSpacer size="m" />
          <EuiText>
            <strong>Total Shards:</strong> {allocationStats?.totalShards ?? 'N/A'}
          </EuiText>
          <EuiText>
            <strong>Unassigned Shards:</strong> {allocationStats?.unassignedShards ?? 'N/A'}
          </EuiText>
          <EuiSpacer size="m" />
          <EuiFlexGroup direction="column">
            {allocationStats?.nodeAllocations.map((node) => (
              <EuiFlexItem key={node.nodeName}>
                <EuiText>
                  <strong>{node.nodeName}:</strong> {node.shardCount} shards
                </EuiText>
                <EuiText>
                  <strong>Disk Used:</strong> {node.diskUsed}
                </EuiText>
                <EuiText>
                  <strong>Disk Available:</strong> {node.diskAvail}
                </EuiText>
                <EuiText>
                  <strong>Disk Total:</strong> {node.diskTotal}
                </EuiText>
                <EuiText>
                  <strong>Disk Percent:</strong> {node.diskPercent}%
                </EuiText>
                <EuiText>
                  <strong>Host:</strong> {node.host}
                </EuiText>
                <EuiText>
                  <strong>IP:</strong> {node.ip}
                </EuiText>
              </EuiFlexItem>
            ))}
          </EuiFlexGroup>
        </>
      ),
    },
    {
      id: 'cat-nodes-tab',
      name: 'Cat/Nodes',
      content: (
        <>
          <EuiSpacer size="m" />
          {catNodesStats.map((node: CatNodeStats) => (
            <EuiFlexGroup key={node.nodeName} justifyContent="spaceBetween">
              <EuiFlexItem>
                <EuiHealth color="primary">
                  {node.nodeName} ({node.ip})
                </EuiHealth>
              </EuiFlexItem>
              <EuiFlexItem>CPU: {node.cpuUsage}</EuiFlexItem>
              <EuiFlexItem>Heap: {node.heapUsage}</EuiFlexItem>
              <EuiFlexItem>Load 1m: {node.load1m}</EuiFlexItem>
              <EuiFlexItem>Load 5m: {node.load5m}</EuiFlexItem>
              <EuiFlexItem>Load 15m: {node.load15m}</EuiFlexItem>
              <EuiFlexItem>Roles: {node.roles}</EuiFlexItem>
            </EuiFlexGroup>
          ))}
        </>
      ),
    },
    {
      id: 'cluster-health-tab',
      name: 'Cluster Health',
      content: (
        <>
          <EuiSpacer size="m" />
          <EuiText>
            <strong>Cluster Name:</strong> {clusterHealth?.clusterName ?? 'N/A'}
          </EuiText>
          <EuiText>
            <strong>Status:</strong> {clusterHealth?.status ?? 'N/A'}
          </EuiText>
          <EuiText>
            <strong>Node(s) Count:</strong> {clusterHealth?.numberOfNodes ?? 'N/A'}
          </EuiText>
          <EuiText>
            <strong>Data Node(s) Count:</strong> {clusterHealth?.numberOfDataNodes ?? 'N/A'}
          </EuiText>
          <EuiText>
            <strong>Active Shards:</strong> {clusterHealth?.activeShards ?? 'N/A'}
          </EuiText>
          <EuiText>
            <strong>Unassigned Shards:</strong> {clusterHealth?.unassignedShards ?? 'N/A'}
          </EuiText>
          <EuiText>
            <strong>Discovered Master:</strong> {clusterHealth?.discoveredMaster ? 'Yes' : 'No'}
          </EuiText>
          <EuiText>
            <strong>Discovered Cluster Manager:</strong> {clusterHealth?.discoveredClusterManager ? 'Yes' : 'No'}
          </EuiText>
          <EuiText>
            <strong>Max Task Wait Time (ms):</strong> {clusterHealth?.taskMaxWaitingInQueueMillis ?? 'N/A'}
          </EuiText>
          <EuiText>
            <strong>Active Shards Percent:</strong> {clusterHealth?.activeShardsPercent ?? 'N/A'}%
          </EuiText>
          <EuiText>
            <strong>JDK Version:</strong> {clusterHealth?.jdkVersion ?? 'N/A'}
          </EuiText>
          <EuiText>
            <strong>Node Version:</strong> {clusterHealth?.nodeVersion ?? 'N/A'}
          </EuiText>
        </>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center' }}>
        <EuiLoadingSpinner size="xl" />
        <EuiText>Loading...</EuiText>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center' }}>
        <EuiText color="danger">{error}</EuiText>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginTop: '20px', fontSize: '20px' }}>
        Current Time: {currentTime} {/* Display current time */}
      </div>
      <EuiSpacer>

      </EuiSpacer>
      <EuiButton onClick={toggleFetching}>{fetching ? 'Stop' : 'Start Monitoring'}</EuiButton>
      <EuiFlexItem>
              <EuiSelect
                options={[
                  { value: '5000', text: '5 seconds' },
                  { value: '10000', text: '10 seconds' },
                  { value: '30000', text: '30 seconds' },
                ]}
                value={String(intervalRate)}
                onChange={e => setIntervalRate(Number(e.target.value))}
                aria-label="Select refresh interval"
              />
      </EuiFlexItem>

      <EuiTabbedContent
        tabs={tabs}
        selectedTab={tabs.find(tab => tab.id === selectedTab)}
        onTabClick={(tab) => setSelectedTab(tab.id)} // Handle tab change
      />
    </div>
  );
};

export default ClusterResourceMonitor;