import { IRouter } from '../../../../src/core/server';

// Define the type for each node's information
interface NodeInfo {
  jdk: string;
  version: string;
}

export const defineRoutes = (router: IRouter) => {
  // Node Stats Route
  router.get(
    {
      path: '/api/cluster_resource_monitor/nodes_stats',
      validate: false,
    },
    async (context, request, response) => {
      try {
        const { body } = await context.core.opensearch.client.asCurrentUser.transport.request({
          method: 'GET',
          path: '/_nodes/stats',
        });

        const stats = Object.keys(body.nodes).map((nodeId) => {
          const node = body.nodes[nodeId];

          return {
            nodeName: node.name,
            cpuUsage: node.os.cpu.percent, // Access CPU usage under os.cpu.percent
            load1m: node.os.cpu.load_average['1m'], // 1-minute load average
            load5m: node.os.cpu.load_average['5m'], // 5-minute load average
            load15m: node.os.cpu.load_average['15m'], // 15-minute load average
            memoryUsage: (node.os.mem.used_in_bytes / node.os.mem.total_in_bytes) * 100, // Memory usage percentage
            memoryFree: node.os.mem.free_percent, // Memory free percentage
            diskUsage: (node.fs.total.total_in_bytes - node.fs.total.free_in_bytes) / (1024 * 1024 * 1024), // Disk usage in GB
            network: {
              inbound: node.transport ? node.transport.rx_size_in_bytes / (1024 * 1024) : 0, // Inbound network traffic (bytes)
              outbound: node.transport ? node.transport.tx_size_in_bytes / (1024 * 1024) : 0, // Outbound network traffic (bytes)
            },
          };
        });

        return response.ok({
          body: stats,
        });
      } catch (error) {
        return response.customError({
          statusCode: 500,
          body: `Error fetching node stats: ${error.message || error}`,
        });
      }
    }
  );

  router.get(
    {
      path: '/api/cluster_resource_monitor/allocation_stats',
      validate: false,
    },
    async (context, request, response) => {
      try {
        const { body } = await context.core.opensearch.client.asCurrentUser.transport.request({
          method: 'GET',
          path: '/_cat/allocation',
          querystring: { format: 'json' },
        });
  
        const allocationStats = body.map((allocation: any) => ({
          nodeName: allocation.node,
          shardCount: parseInt(allocation.shards, 10),
          diskIndices: allocation['disk.indices'] || 'N/A',
          diskUsed: allocation['disk.used'] || 'N/A',
          diskAvail: allocation['disk.avail'] || 'N/A',
          diskTotal: allocation['disk.total'] || 'N/A',
          diskPercent: allocation['disk.percent'] || 'N/A',
          host: allocation.host || 'N/A',
          ip: allocation.ip || 'N/A',
        }));
  
        const totalShards = allocationStats.reduce(
          (sum: number, alloc: { shardCount: number }) => sum + alloc.shardCount,
          0
        );
  
        const unassignedShards = body.filter((allocation: any) => allocation.node === 'UNASSIGNED').length;
  
        return response.ok({
          body: {
            totalShards,
            unassignedShards,
            nodeAllocations: allocationStats,
          },
        });
      } catch (error) {
        return response.customError({
          statusCode: 500,
          body: `Error fetching allocation stats: ${error.message || error}`,
        });
      }
    }
  );  

  // Cat Nodes Route
  router.get(
    {
      path: '/api/cluster_resource_monitor/cat_nodes',
      validate: false,
    },
    async (context, request, response) => {
      try {
        const { body } = await context.core.opensearch.client.asCurrentUser.transport.request({
          method: 'GET',
          path: '/_cat/nodes',
          querystring: { format: 'json' },
        });

        const catNodes = body.map((node: any) => ({
          nodeName: node.name,
          ip: node.ip,
          cpuUsage: `${node.cpu}%`,
          heapUsage: `${node['heap.percent']}%`, // Note the correct field
          load1m: node['load_1m'], // 1 minute load average
          load5m: node['load_5m'], // 5 minute load average
          load15m: node['load_15m'], // 15 minute load average
          roles: node['node.roles'].split(',').join(', '), // Join roles into a string
        }));

        return response.ok({
          body: catNodes,
        });
      } catch (error) {
        return response.customError({
          statusCode: 500,
          body: `Error fetching cat nodes stats: ${error.message || error}`,
        });
      }
    }
  );

  router.get(
    {
      path: '/api/cluster_resource_monitor/cluster_health',
      validate: false,
    },
    async (context, request, response) => {
      try {
        // Fetch cluster health information
        const { body } = await context.core.opensearch.client.asCurrentUser.transport.request({
          method: 'GET',
          path: '/_cluster/health',
        });
  
        // Fetch JDK and Node version from _cat/nodes (returns JSON array)
        const nodesInfoResponse = await context.core.opensearch.client.asCurrentUser.transport.request({
          method: 'GET',
          path: '/_cat/nodes?format=json&h=jdk,version',
        });
  
        // Extract the actual body from the ApiResponse and cast it to NodeInfo[]
        const nodesInfo: NodeInfo[] = nodesInfoResponse.body as NodeInfo[];
  
        // Debugging: log the nodesInfo to verify the response format
        //console.log("Nodes Info:", nodesInfo);
  
        // Ensure nodesInfo is a non-empty array
        if (Array.isArray(nodesInfo) && nodesInfo.length > 0) {
          const node = nodesInfo[0]; // Take the first node's information
          const jdkVersion = node.jdk;  // JDK version
          const nodeVersion = node.version;  // Node version
  
          // Build the cluster health response object
          const clusterHealth = {
            clusterName: body.cluster_name,
            status: body.status,
            numberOfNodes: body.number_of_nodes,
            numberOfDataNodes: body.number_of_data_nodes,
            activeShards: body.active_shards,
            relocatingShards: body.relocating_shards,
            unassignedShards: body.unassigned_shards,
            discoveredMaster: body.discovered_master,
            discoveredClusterManager: body.discovered_cluster_manager,
            taskMaxWaitingInQueueMillis: body.task_max_waiting_in_queue_millis,
            activeShardsPercent: body.active_shards_percent_as_number,
            jdkVersion, // JDK Version
            nodeVersion, // Node Version
          };
          return response.ok({
            body: clusterHealth,
          });
        } else {
          console.error("Error: No node info found");
          return response.customError({
            statusCode: 500,
            body: 'Error: No node info found',
          });
        }
      } catch (error) {
        return response.customError({
          statusCode: 500,
          body: `Error fetching cluster health: ${error.message || error}`,
        });
      }
    }
  );  

  // Route to fetch the logged-in user's roles
  router.get(
    {
      path: '/api/cluster_resource_monitor/user_roles',
      validate: false,
    },
    async (context, request, response) => {
      try {
        // Fetch the logged-in user's info
        const { body: authInfo } = await context.core.opensearch.client.asCurrentUser.transport.request({
          method: 'GET',
          path: '/_plugins/_security/authinfo',
        });

        // Extract user roles and other relevant information
        const userName = authInfo.user_name || 'unknown';
        const backendRoles = authInfo.backend_roles || [];
        const roles = authInfo.roles || [];
        const tenants = authInfo.tenants || {};

        return response.ok({
          body: {
            user: userName,
            backend_roles: backendRoles,
            roles: roles,
            tenants: tenants,
          },
        });
      } catch (error) {
        return response.customError({
          statusCode: error.statusCode || 500,
          body: `Error fetching user roles: ${error.message || error}`,
        });
      }
    }
  );
}
