// import React, { useEffect, useState } from 'react';
// import { Modal, Form, Select, App } from 'antd';
// import { permissionsService } from '@/services/system/permissions.service';
// import { RoleWithPermissions } from '../page';

// interface Props {
//     visible: boolean;
//     onClose: () => void;
//     onSuccess: () => void;
//     data: RoleWithPermissions;
//     allActions: string[];
// }

// export default function ModalUpdate({ visible, onClose, onSuccess, data, allActions }: Props) {
//     const { message } = App.useApp();
//     const [form] = Form.useForm();
//     const [loading, setLoading] = useState(false);

//     useEffect(() => {
//         if (visible && data) {
//             // Set value default berupa array string dari permission yang sudah dimiliki
//             const currentActions = data.rolePermissions.map(p => p.action);
//             form.setFieldsValue({ actions: currentActions });
//         }
//     }, [visible, data, form]);

//     const handleOk = async () => {
//         try {
//             const values = await form.validateFields();
//             setLoading(true);

//             const newActions: string[] = values.actions || [];
//             const oldPermissions = data.rolePermissions || [];
//             const oldActions = oldPermissions.map(p => p.action);

//             // 1. Cari permission apa saja yang BARU DITAMBAHKAN
//             const actionsToAdd = newActions.filter(a => !oldActions.includes(a));
            
//             // 2. Cari permission apa saja yang DIHAPUS (ada di old, tapi tidak ada di new)
//             const permissionsToRemove = oldPermissions.filter(p => !newActions.includes(p.action));

//             // 3. Eksekusi API secara parallel (simultan) agar cepat
//             const addPromises = actionsToAdd.map(action => 
//                 permissionsService.create({ roleId: data.id, action })
//             );
//             const removePromises = permissionsToRemove.map(p => 
//                 permissionsService.remove(p.id)
//             );

//             await Promise.all([...addPromises, ...removePromises]);

//             message.success(`Permissions for ${data.name} updated successfully!`);
//             onSuccess();
//             onClose();
//         } catch (error: any) {
//             message.error('Failed to update permissions. Please try again.');
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <Modal 
//             title={`Set Permissions for: ${data.name}`} 
//             open={visible} 
//             onOk={handleOk} 
//             onCancel={onClose} 
//             confirmLoading={loading}
//             destroyOnHidden
//             width={600}
//         >
//             <Form form={form} layout="vertical" className="mt-4">
//                 <Form.Item 
//                     name="actions" 
//                     label="Assigned Permissions" 
//                     tooltip="Ketik nama permission lalu tekan Enter, atau pilih dari daftar yang sudah ada."
//                 >
//                     <Select 
//                         mode="tags" 
//                         placeholder="e.g. product:read (Ketik lalu tekan Enter)" 
//                         style={{ width: '100%' }}
//                         options={allActions.map(action => ({ label: action, value: action }))}
//                         tokenSeparators={[',']} // Kalau user paste teks dipisah koma, otomatis jadi tag
//                         size="large"
//                     />
//                 </Form.Item>
//                 <p className="text-xs text-gray-500 mt-2">
//                     * Modul umum: <code className="bg-gray-100 px-1 rounded">read</code>, <code className="bg-gray-100 px-1 rounded">write</code>, <code className="bg-gray-100 px-1 rounded">delete</code>. <br/>
//                     Contoh: <b>users:read</b>, <b>inventory:write</b>.
//                 </p>
//             </Form>
//         </Modal>
//     );
// }