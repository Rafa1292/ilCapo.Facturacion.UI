import React, { useContext, useEffect, useState } from 'react'
import '../../scss/billMaker.scss'
import { SaleItemCategory } from '../../types/saleItemCategory'
import { usePost, usePatch } from '../../hooks/useAPI'
import BillMakerItems from '../../components/billMaker/BillMakerItems'
import useBill from '../../hooks/useBill'
import BillResume from '../../components/BillResume'
import CustomInputSelect from '../../components/generics/CustomInputSelect'
import { BillItemLinkedProduct } from '../../types/billItemLinkedProduct'
import { BillItem } from '../../types/billItem'
import Swal from 'sweetalert2'
import AppContext from '../../context/AppContext'
import { BillFunctions } from '../../types/billFunctions'
import BillPayMethod from '../../components/BillPayMethod'
import { Bill } from '../../types/bill'
import { Client } from '../../types/client'

interface Props {
  close: () => void
  saleItemCategories: SaleItemCategory[]
  bill: Bill
}

interface SearchProduct {
  id: number
  categoryId: number
  saleItemId: number
  name: string
}

const initialBillItem: BillItem = {
  id: 0,
  quantity: 1,
  billId: 0,
  saleItemId: 0,
  billProducts: [],
  delete: false,
  description: '',
  discount: 0,
  kitchenMessage: false,
  tax: 0,
  unitPrice: 0,
  createdBy: 0,
  updatedBy: 0
}


const BillMaker = ({ close, saleItemCategories, bill }: Props) => {
  const [saleItemCategory, setSaleItemCategory] = useState<SaleItemCategory>()
  const [searchProducts, setSearchProducts] = useState<SearchProduct[]>([])
  const [editBillItem, setEditBillItem] = useState<BillItem>({ saleItemId: 0 } as BillItem)
  const { user, billFunctions } = useContext(AppContext)
  const { addBillItem, removeLinkedProduct, getClient } = billFunctions
  const [showPayMethods, setShowPayMethods] = useState(false)
  const [pullApartBill, setPullApartBill] = useState<boolean>(false)

  const handleEditLinkedProduct = (saleItemId: number, itemNumber: number) => {
    const tmpBillItem = billFunctions.editLinkedProduct(saleItemId, itemNumber, bill.id, bill.tableNumber)
    if (tmpBillItem) {
      for (const category of saleItemCategories) {
        const tmpSaleItem = category.saleItems.find(saleItem => saleItem.id === tmpBillItem.saleItemId)
        if (tmpSaleItem) {
          setSaleItemCategory(category)
          break
        }
      }
      setEditBillItem(tmpBillItem)
    }
  }

  // Refactorized
  const initializeSearchProducts = (saleItemCategories: SaleItemCategory[]) => {
    const tmpSearchProducts: SearchProduct[] = []
    for (const saleItemCategory of saleItemCategories) {
      for (const saleItem of saleItemCategory.saleItems) {
        const tmpSearchProduct: SearchProduct = {
          id: 0,
          categoryId: saleItemCategory.id,
          saleItemId: saleItem.id,
          name: saleItem.name
        }
        tmpSearchProducts.push(tmpSearchProduct)
      }
    }
    setSearchProducts(tmpSearchProducts)
  }

  const handleChangeSaleItemCategory = (saleItemCategory: SaleItemCategory) => {
    setEditBillItem({ saleItemId: 0 } as BillItem)
    setSaleItemCategory(saleItemCategory)
  }

  const handleChange = (event: any) => {
    const { value } = event.target
    const tmpSearchProduct = searchProducts.find(searchProduct => searchProduct.saleItemId === value)
    if (tmpSearchProduct) {
      const tmpSaleItemCategory = saleItemCategories.find(saleItemCategory => saleItemCategory.id === tmpSearchProduct.categoryId)
      if (tmpSaleItemCategory) {
        setSaleItemCategory(tmpSaleItemCategory)
        const tmpSaleItem = tmpSaleItemCategory.saleItems.find(saleItem => saleItem.id === tmpSearchProduct.saleItemId)
        if (tmpSaleItem) {
          setEditBillItem({ ...initialBillItem, saleItemId: tmpSaleItem.id })
        }
      }
    }
  }

  const commandBill = async () => {
    if (validateBill()) {
      if (bill?.id === 0) {
        await newBill()
      }
      else {
        await updateBill()
      }
    }
  }

  const newBill = async () => {
    bill.workDayUserIdOpen = user.workDayUser.id
    bill.workDayUserIdClose = user.workDayUser.id
    const response = await usePost<Bill>('bills', {...bill, commandTime: new Date(Date.now())}, true)
    if (!response.error) {
      const { id } = response.data
      billFunctions.updateBillFromDB(id)
      close()
    }
  }

  const updateBill = async () => {
    const response = await usePatch('bills', {...bill, commandTime: new Date(Date.now())}, true)
    if (!response.error) {
      billFunctions.updateBillFromDB(bill.id)
      close()
    }
  }

  const validateBill = (): boolean => {
    if (!bill?.isCommanded)
      return true
    let valid = false
    for (const billItem of bill.items) {
      for (const billItemLinkedProduct of billItem.billProducts) {
        for (const linkedProduct of billItemLinkedProduct.products) {
          if (!linkedProduct.isCommanded)
            valid = true
        }
      }
    }

    if (!valid) {
      Swal.fire('Error', 'No hay productos nuevos para comandar', 'error')
    } else {
      if (bill.clientId === 0) {
        valid = false
        Swal.fire('Error', 'Debe asignar un cliente', 'error')
      }
    }

    return valid
  }

  useEffect(() => {
    initializeSearchProducts(saleItemCategories)
  }, [bill])


  return (
    <div className='col-12 d-flex flex-wrap'>
      {
        showPayMethods
        &&
        <div className="col-8 d-flex justify-content-center flex-wrap scroll" style={{ maxHeight: '100vh', alignContent: 'baseline', overflowY: 'scroll' }}>
          <BillPayMethod close={close}
            setPullApartBill={setPullApartBill} pullApartBill={pullApartBill} bill={bill} />
        </div>
        ||
        <div className="col-8 bill-maker" >
          <div className="col-12 d-flex flex-wrap justify-content-end p-2">
            <div className="col-6">
              <CustomInputSelect showLabel={false} value={editBillItem?.saleItemId}
                customInputSelect={
                  {
                    label: 'Productos', name: 'id',
                    handleChange: handleChange, pattern: '', validationMessage: ''
                  }}
                data={searchProducts.map(searchProduct => { return { value: searchProduct.saleItemId, label: searchProduct.name } })}
                defaultLegend={'Productos'}
              />
            </div>
          </div>
          <div className="col-8 d-flex flex-wrap justify-content-around position-absolute bg-dark p-2 shadow"
            style={{ borderBottom: '1px solid rgba(255,193,7,0.8)', top: '0' }}>
            {
              saleItemCategories.map((tmpSaleItemCategory, index) => {
                return (
                  <div key={index} onClick={() => handleChangeSaleItemCategory(tmpSaleItemCategory)} className="px-3 py-1 rounded pointer item-category" >
                    <h6 className='m-0'>{tmpSaleItemCategory.name}</h6>
                  </div>
                )
              })
            }
          </div>
          <div className="position-absolute ">
            <button className='btn btn-success' onClick={() => console.log(billFunctions.bills)}>bills</button>
          </div>
          {
            saleItemCategory &&
            <BillMakerItems
              tableNumber={bill.tableNumber}
              editBilItem={editBillItem ? editBillItem : { saleItemId: 0 } as BillItem}
              saleItemCategory={saleItemCategory} />
          }
        </div>
      }
      <div className="col-4 shadow bill-resume position-relative" style={{ height: '100vh', zIndex: '100' }}>
        <BillResume
          pullApartBill={pullApartBill}
          showPayMethods={() => setShowPayMethods(!showPayMethods)} commandBill={commandBill}
          handleEditLinkedProduct={handleEditLinkedProduct}
          bill={bill} />
      </div>
    </div>
    ||
    <></>
  )
}

export default BillMaker