import { storageApi } from '../api/storageApi';
import { BlobServiceClient } from '@azure/storage-blob';
import { ValidationError } from '../../middleware/errorHandler';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Adaptateur pour faire le pont entre l'ancienne API storageService et la nouvelle storageApi
 */
export const storageService = {
  getClient() {
    return BlobServiceClient.fromConnectionString(
      process.env.AZURE_STORAGE_CONNECTION_STRING
    );
  },

  async createContainer(containerName, options = {}) {
    const client = this.getClient();
    const containerClient = client.getContainerClient(containerName);
    
    const exists = await containerClient.exists();
    if (exists) {
      throw new ValidationError('Container already exists');
    }
    
    await containerClient.create({
      access: options.public ? 'container' : 'blob',
      ...options
    });
    
    return {
      name: containerName,
      created: true
    };
  },

  async listContainers() {
    const client = this.getClient();
    const containers = [];
    
    for await (const container of client.listContainers()) {
      containers.push({
        name: container.name,
        properties: container.properties
      });
    }
    
    return containers;
  },

  async getContainer(containerName) {
    const client = this.getClient();
    const containerClient = client.getContainerClient(containerName);
    
    const exists = await containerClient.exists();
    if (!exists) {
      throw new Error('Container not found');
    }
    
    const properties = await containerClient.getProperties();
    
    return {
      name: containerName,
      properties: properties
    };
  },

  async deleteContainer(containerName) {
    const client = this.getClient();
    const containerClient = client.getContainerClient(containerName);
    
    await containerClient.delete();
    
    return { success: true };
  },

  async listBlobs(containerName, options = {}) {
    const client = this.getClient();
    const containerClient = client.getContainerClient(containerName);
    
    const blobs = [];
    const listOptions = {
      prefix: options.prefix,
      includeMetadata: true
    };
    
    for await (const blob of containerClient.listBlobsFlat(listOptions)) {
      blobs.push({
        name: blob.name,
        properties: blob.properties,
        metadata: blob.metadata
      });
    }
    
    return blobs;
  },

  async uploadBlob(containerName, blobName, content, options = {}) {
    const client = this.getClient();
    const containerClient = client.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    
    const uploadOptions = {
      blobHTTPHeaders: {
        blobContentType: options.contentType
      },
      metadata: options.metadata
    };
    
    await blockBlobClient.upload(content, content.length, uploadOptions);
    
    return {
      name: blobName,
      url: blockBlobClient.url
    };
  },

  async downloadBlob(containerName, blobName) {
    const client = this.getClient();
    const containerClient = client.getContainerClient(containerName);
    const blobClient = containerClient.getBlobClient(blobName);
    
    const exists = await blobClient.exists();
    if (!exists) {
      throw new Error('Blob not found');
    }
    
    const downloadResponse = await blobClient.download();
    
    return {
      contentType: downloadResponse.contentType,
      contentLength: downloadResponse.contentLength,
      stream: downloadResponse.readableStreamBody
    };
  },

  async deleteBlob(containerName, blobName) {
    const client = this.getClient();
    const containerClient = client.getContainerClient(containerName);
    const blobClient = containerClient.getBlobClient(blobName);
    
    await blobClient.delete();
    
    return { success: true };
  },

  async searchBuilds(options = {}) {
    const { type, organizationId } = options;
    const builds = [];
    
    // Search in predefined Unity build locations
    const searchContainers = [
      'wisetrainer-builds',
      'wisetwin-builds'
    ];
    
    if (organizationId) {
      // Get organization container
      const org = await prisma.organization.findUnique({
        where: { id: organizationId }
      });
      if (org?.azureContainer) {
        searchContainers.push(org.azureContainer);
      }
    }
    
    const client = this.getClient();
    
    for (const containerName of searchContainers) {
      try {
        const containerClient = client.getContainerClient(containerName);
        const exists = await containerClient.exists();
        
        if (!exists) continue;
        
        // Look for Unity build files
        for await (const blob of containerClient.listBlobsFlat()) {
          if (blob.name.includes('.loader.js') || 
              blob.name.includes('Build.json')) {
            const buildName = blob.name.split('/')[0];
            const buildType = containerName.includes('wisetrainer') ? 
              'WISETRAINER' : 'WISETWIN';
            
            if (!type || type === buildType) {
              builds.push({
                name: buildName,
                type: buildType,
                container: containerName,
                path: buildName,
                lastModified: blob.properties.lastModified
              });
            }
          }
        }
      } catch (error) {
        console.error(`Error searching container ${containerName}:`, error);
      }
    }
    
    return builds;
  },

  generateSASUrl(containerName, blobName, permissions = 'r', expiryHours = 24) {
    const client = this.getClient();
    const containerClient = client.getContainerClient(containerName);
    const blobClient = containerClient.getBlobClient(blobName);
    
    const startsOn = new Date();
    const expiresOn = new Date(startsOn);
    expiresOn.setHours(expiresOn.getHours() + expiryHours);
    
    const sasUrl = blobClient.generateSasUrl({
      permissions,
      startsOn,
      expiresOn
    });
    
    return sasUrl;
  }
};